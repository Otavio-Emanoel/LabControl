import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useFocusEffect } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectionBadge from '@/components/ConnectionBadge';

// Slots fixos (alinhar com backend)
const SLOTS = [
  { key: '1', start: '08:00', end: '08:50' },
  { key: '2', start: '08:50', end: '09:40' },
  { key: '3', start: '10:00', end: '10:50' },
  { key: '4', start: '10:50', end: '11:40' },
  { key: '5', start: '11:40', end: '12:30' },
  { key: '6', start: '12:30', end: '13:20' },
  { key: '7', start: '13:30', end: '14:20' },
  { key: '8', start: '14:20', end: '15:10' },
  { key: '9', start: '15:10', end: '16:00' },
] as const;

interface Lab {
  id_Laboratorio: number;
  numero: string;
  descricao?: string | null;
}

interface Reserva {
  id_Reserva: number;
  horario: string; // HH:mm:ss
  dia: string; // YYYY-MM-DD
  justificativa?: string | null;
  fk_aulas?: number | null;
  nome_disciplina?: string | null;
  id_usuario: number;
  nome_usuario: string;
  id_Laboratorio: number;
  numero_laboratorio: string;
  // campos adicionais quando for horário fixo
  isFixo?: boolean;
  id_fixo?: number;
}

function toYMD(dia: unknown): string {
  if (typeof dia === 'string') return dia.slice(0, 10);
  if (dia && typeof dia === 'object' && typeof (dia as any).getFullYear === 'function') {
    const dt = dia as Date;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const dt = new Date(dia as any);
  if (isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeToHHmm(v: unknown): string {
  if (typeof v === 'string') {
    const m = v.match(/^(\d{2}:\d{2})/);
    return m ? m[1] : '';
  }
  if (v && typeof v === 'object' && typeof (v as any).getHours === 'function') {
    const dt = v as Date;
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '';
}

function getInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase();
}

// Converte YYYY-MM-DD para rótulo de dia da semana esperado pelo backend de horários fixos
function ymdToDiaSemana(ymd: string) {
  try {
    const d = new Date(`${ymd}T00:00:00`);
    const idx = d.getDay(); // 0..6 (0=domingo)
    const dias = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'] as const;
    return dias[idx];
  } catch {
    return '';
  }
}

export default function AgendamentosDiaPage() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const ymd = (date as string) || new Date().toISOString().slice(0, 10);
  const router = useRouter();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [renderCapture, setRenderCapture] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmLab, setConfirmLab] = useState<{ id: number } | null>(null);

  // Novos estados para interação com reservas
  const [cargo, setCargo] = useState<string>('');
  const isAuxCoord = cargo === 'Coordenador' || cargo === 'Auxiliar_Docente' || (typeof cargo === 'string' && /(coordenador|auxiliar)/i.test(cargo));
  const [resModalVisible, setResModalVisible] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reserva | null>(null);
  const [editJust, setEditJust] = useState(false);
  const [editJustText, setEditJustText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isWeb = Platform.OS === 'web';
  const TIME_W = isWeb ? 120 : 100;
  const COL_W = isWeb ? 200 : 152;
  const HEADER_H = isWeb ? 56 : 48;
  const ROW_PAD_V = isWeb ? 16 : 14;
  const FONT_LAB = isWeb ? 14 : 13;

  const visibleTableRef = useRef<View>(null);
  const captureTableRef = useRef<View>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const ds = ymdToDiaSemana(ymd);
      const [labsRes, reservasRes, fixosRes] = await Promise.all([
        api.get<Lab[]>(`/labs/all`),
        api.get<Reserva[]>(`/agendamentos/all`),
        api.get<any[]>(`/horarios-fixos/`),
      ]);
      setLabs(labsRes.data as any);
      const allRes = reservasRes.data as any as Reserva[];
      const doDia = allRes.filter((r) => toYMD(r.dia) === ymd);

      // mapeia fixos do mesmo dia da semana para o formato visual de reserva
      let fixosMapped: Reserva[] = [];
      if (Array.isArray(fixosRes.data) && ds) {
        fixosMapped = (fixosRes.data as any[])
          .filter((f) => String(f.dia_semana).toLowerCase() === ds)
          .map((f) => {
            const numeroLab = f.nome_laboratorio ?? f.numero_laboratorio ?? f.numero ?? '';
            return {
              id_Reserva: -100000 - Number(f.id_horario_fixo || 0),
              id_fixo: Number(f.id_horario_fixo || 0),
              isFixo: true,
              horario: String(f.horario),
              dia: ymd,
              justificativa: null,
              fk_aulas: null,
              nome_disciplina: null,
              id_usuario: Number(f.id_usuario),
              nome_usuario: String(f.nome_usuario || ''),
              id_Laboratorio: Number(f.id_Laboratorio),
              numero_laboratorio: String(numeroLab),
            } as Reserva;
          });
      }

      // combina: primeiro reservas do dia (prioridade), depois preenche espaços com fixos
      // construiremos um mapa para evitar duplicidade SLOT/LAB
      const ocupados = new Set(doDia.map((r) => `${r.id_Laboratorio}-${timeToHHmm(r.horario)}`));
      const fixosSemConflito = fixosMapped.filter((f) => !ocupados.has(`${f.id_Laboratorio}-${timeToHHmm(f.horario)}`));

      setReservas([...doDia, ...fixosSemConflito]);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [ymd]);

  useEffect(() => {
    load();
  }, [load]);

  // Carrega cargo do usuário logado
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.cargo) setCargo(u.cargo);
        }
        // fallback para API
        try {
          const me = await api.get<{ user?: { cargo?: string } }>(`/auth/me`);
          const c = me.data?.user?.cargo;
          if (c) setCargo(c);
        } catch {}
      } catch {}
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  // Texto do dia da semana para o cabeçalho
  const weekday = useMemo(() => {
    try {
      const dt = new Date(`${ymd}T00:00:00`);
      return dt.toLocaleDateString('pt-BR', { weekday: 'long' });
    } catch {
      return '';
    }
  }, [ymd]);

  // Mapa de reservas por (labId, HH:mm)
  const cellMap = useMemo(() => {
    const map = new Map<string, Reserva>();
    for (const r of reservas) {
      const hhmm = timeToHHmm(r.horario);
      const key = `${r.id_Laboratorio}-${hhmm}`;
      if (!map.has(key)) map.set(key, r);
    }
    return map;
  }, [reservas]);

  const exportToPng = useCallback(async () => {
    try {
      setExporting(true);
      setErrorMsg(null);
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        setErrorMsg('Permissão de mídia negada. Não foi possível salvar a imagem.');
        setExporting(false);
        return;
      }
      // Renderiza versão offscreen completa
      setRenderCapture(true);
      await new Promise((r) => setTimeout(r, 300)); // aguarda render um pouco mais
      if (!captureTableRef.current) {
        setErrorMsg('Não foi possível preparar a captura. Tente novamente.');
        return;
      }
      const uri = await captureRef(captureTableRef.current as View, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      } as any);
      await MediaLibrary.createAssetAsync(uri);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch {
      setErrorMsg('Falha ao exportar PNG.');
    } finally {
      setRenderCapture(false);
      setExporting(false);
    }
  }, []);

  const askSchedule = useCallback((labId: number) => {
    setConfirmLab({ id: labId });
    setConfirmVisible(true);
  }, []);

  // Abre modal de detalhes da reserva
  const openReserva = useCallback((res: Reserva) => {
    setSelectedRes(res);
    setEditJust(false);
    setEditJustText(res.justificativa || '');
    setResModalVisible(true);
  }, []);

  const goToSchedule = useCallback(() => {
    if (confirmLab) {
      router.push(`/agendar?labId=${confirmLab.id}&date=${ymd}`);
      setConfirmVisible(false);
    }
  }, [confirmLab, router, ymd]);

  const confirmarRemocao = useCallback(() => {
    if (!selectedRes) return;
    // se for fixo
    if (selectedRes.isFixo) {
      if (!isAuxCoord) {
        Alert.alert('Ação não permitida', 'Apenas Coordenador ou Auxiliar Docente podem remover horários fixos.');
        return;
      }
      Alert.alert(
        'Remover horário fixo',
        'Tem certeza que deseja remover este horário fixo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeleting(true);
                const idFixo = selectedRes.id_fixo;
                if (!idFixo) throw new Error('ID do horário fixo não encontrado.');
                await api.delete(`/horarios-fixos/${idFixo}`);
                setResModalVisible(false);
                setSelectedRes(null);
                await load();
              } catch (e: any) {
                Alert.alert('Erro', e?.response?.data?.error || 'Falha ao remover horário fixo');
              } finally {
                setDeleting(false);
              }
            },
          },
        ]
      );
      return;
    }
    // reserva normal
    Alert.alert(
      'Remover agendamento',
      'Tem certeza que deseja remover este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await api.post(`/agendamentos/delete/${selectedRes.id_Reserva}`);
              setResModalVisible(false);
              setSelectedRes(null);
              await load();
            } catch (e: any) {
              Alert.alert('Erro', e?.response?.data?.error || 'Falha ao remover agendamento');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [selectedRes, load, isAuxCoord]);

  const salvarJustificativa = useCallback(async () => {
    if (!selectedRes) return;
    if (selectedRes.isFixo) {
      Alert.alert('Ação não disponível', 'Horário fixo não possui justificativa para editar.');
      return;
    }
    try {
      setSaving(true);
      await api.post(`/agendamentos/justificativa/${selectedRes.id_Reserva}`, { justificativa: editJustText });
      setEditJust(false);
      await load();
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.error || 'Falha ao salvar justificativa');
    } finally {
      setSaving(false);
    }
  }, [selectedRes, editJustText, load]);

  // Wrapper rolável no web para permitir scroll da página inteira, mantendo mobile como está
  const Wrapper: any = isWeb ? ScrollView : View;
  const wrapperProps: any = isWeb
    ? { style: { flex: 1, backgroundColor: 'black', paddingTop: 8 }, contentContainerStyle: { paddingBottom: 24 } }
    : { style: { flex: 1, backgroundColor: 'black', paddingTop: 16 } };

  // Formata nome do lab no modal: "Laboratório X" (extrai número mesmo se vier como "lab2")
  const selectedLab = useMemo(() => {
    if (!confirmLab) return null as Lab | null;
    return labs.find((l) => l.id_Laboratorio === confirmLab.id) || null;
  }, [labs, confirmLab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black'}}>
      <View style={{ position: 'absolute', zIndex: 50, right: isWeb ? 50 : 12, top: isWeb ? 12 : undefined, bottom: isWeb ? undefined : 12 }}>
        <ConnectionBadge />
      </View>
      <Wrapper {...wrapperProps}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: isWeb ? 0 : 16, paddingTop: 16, paddingBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: isWeb ? 22 : 18, fontWeight: '700', marginLeft: 8, flex: 1 }}>
            Agendamentos de {weekday && `${weekday}, `}{ymd}
          </Text>
          <TouchableOpacity onPress={exportToPng} disabled={exporting} style={{ padding: 8, opacity: exporting ? 0.6 : 1 }}>
            {exporting ? (
              <ActivityIndicator size="small" color="#3B96E2" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator size="small" color="#3B96E2" />
          </View>
        ) : null}

        {errorMsg ? (
          <Text style={{ color: '#F87171', marginTop: 8, textAlign: 'center' }}>{errorMsg}</Text>
        ) : null}

        {/* Container da tabela (visível) */}
        <View ref={visibleTableRef} style={{ marginTop: isWeb ? 16 : 12, marginHorizontal: isWeb ? 0 : 12, backgroundColor: '#0B0F19', borderRadius: 12, borderWidth: 1, borderColor: '#111827', overflow: 'hidden' }}>
          {/* Cabeçalho + corpo enrolados horizontalmente juntos */}
          <ScrollView horizontal nestedScrollEnabled directionalLockEnabled showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 12 }}>
            <View>
              {/* Cabeçalho: primeira célula vazia (horários) + colunas de laboratórios */}
              <View style={{ flexDirection: 'row', backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#111827' }}>
                {/* canto vazio */}
                <View style={{ width: TIME_W, height: HEADER_H, borderRightWidth: 1, borderRightColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#9CA3AF', fontSize: isWeb ? 13 : 12 }}>Horário</Text>
                </View>
                {labs.map((lab) => (
                  <View
                    key={lab.id_Laboratorio}
                    style={{ width: COL_W, height: HEADER_H, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#111827' }}
                  >
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: FONT_LAB }}>{lab.descricao?.trim() || `Lab ${lab.numero}`}</Text>
                  </View>
                ))}
              </View>

              {/* Corpo com rolagem vertical */}
              <ScrollView nestedScrollEnabled directionalLockEnabled showsVerticalScrollIndicator>
                {SLOTS.map((slot, idx) => (
                  <View key={slot.key} style={{ flexDirection: 'row' }}>
                    {/* Coluna de horários */}
                    <View style={{ width: TIME_W, paddingVertical: ROW_PAD_V, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: idx % 2 ? '#0C1220' : '#0F172A' }}>
                      <Text style={{ color: '#E5E7EB', fontWeight: '700' }}>{slot.start}</Text>
                      <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{slot.end}</Text>
                    </View>

                    {/* Células por laboratório */}
                    {labs.map((lab) => {
                      const key = `${lab.id_Laboratorio}-${slot.start}`;
                      const r = cellMap.get(key);
                      const rowBg = idx % 2 ? '#0C1220' : '#0F172A';
                      return (
                        <View key={key} style={{ width: COL_W, padding: 10, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: rowBg }}>
                          {r ? (
                            <TouchableOpacity onPress={() => openReserva(r)} activeOpacity={0.8}>
                              <View style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', borderRadius: 10, padding: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#1C4AED', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 10 }}>{getInitials(r.nome_usuario)}</Text>
                                  </View>
                                  <Text style={{ color: 'white', fontWeight: '700', flexShrink: 1, fontSize: isWeb ? 13 : 12 }} numberOfLines={1}>{r.nome_usuario}</Text>
                                  {r.isFixo ? (
                                    <View style={{ marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#115e59' }}>
                                      <Text style={{ color: '#34D399', fontSize: 10, fontWeight: '800' }}>FIXO</Text>
                                    </View>
                                  ) : null}
                                </View>
                                <Text style={{ color: '#9CA3AF', marginTop: 4, fontSize: isWeb ? 12 : 12 }} numberOfLines={2}>
                                  {r.isFixo ? 'Horário fixo' : (r.nome_disciplina ? `Aula de ${r.nome_disciplina}` : r.justificativa || 'Agendamento')}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={() => askSchedule(lab.id_Laboratorio)}
                              style={{ alignSelf: 'flex-start', backgroundColor: '#052e1a', borderWidth: 1, borderColor: '#16A34A', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}
                            >
                              <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: isWeb ? 12 : 12 }}>Livre</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Legenda */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 16, borderTopWidth: 1, borderTopColor: '#111827' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#052e1a', borderWidth: 1, borderColor: '#16A34A', marginRight: 6 }} />
              <Text style={{ color: '#9CA3AF' }}>Livre</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', marginRight: 6 }} />
              <Text style={{ color: '#9CA3AF' }}>Reservado</Text>
            </View>
          </View>
        </View>
        {/* Modal de confirmação */}
        <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <View style={{ width: '92%', maxWidth: 420, backgroundColor: '#111827', borderRadius: 14, padding: 16 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Agendar neste dia?</Text>
              <Text style={{ color: '#9CA3AF', marginTop: 6 }}>
                {`Você deseja agendar no dia ${ymd} para o ${selectedLab?.descricao?.trim() || `Laboratório ${selectedLab?.numero ?? ''}` }?`}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <TouchableOpacity onPress={() => setConfirmVisible(false)} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#374151' }}>
                  <Text style={{ color: 'white' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToSchedule} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#3B96E2' }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Agendar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de detalhes da reserva */}
        <Modal visible={resModalVisible} transparent animationType="fade" onRequestClose={() => setResModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <View style={{ width: '92%', maxWidth: 480, backgroundColor: '#111827', borderRadius: 14, padding: 16 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Detalhes do agendamento</Text>
              {selectedRes ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: '#9CA3AF', marginTop: 2 }}>Professor: <Text style={{ color: 'white' }}>{selectedRes.nome_usuario}</Text></Text>
                  <Text style={{ color: '#9CA3AF', marginTop: 2 }}>Tipo: <Text style={{ color: 'white' }}>{selectedRes.isFixo ? 'Horário fixo' : 'Reserva'}</Text></Text>
                  <Text style={{ color: '#9CA3AF', marginTop: 2 }}>Disciplina: <Text style={{ color: 'white' }}>{selectedRes.nome_disciplina || '-'}</Text></Text>
                  <Text style={{ color: '#9CA3AF', marginTop: 2 }}>Laboratório: <Text style={{ color: 'white' }}>Lab {selectedRes.numero_laboratorio}</Text></Text>
                  <Text style={{ color: '#9CA3AF', marginTop: 2 }}>Dia: <Text style={{ color: 'white' }}>{toYMD(selectedRes.dia)}</Text></Text>
                  <Text style={{ color: '#9CA3AF', marginTop: 2 }}>Horário: <Text style={{ color: 'white' }}>{timeToHHmm(selectedRes.horario)}</Text></Text>

                  {!selectedRes.isFixo && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ color: '#9CA3AF' }}>Justificativa:</Text>
                      {editJust ? (
                        <TextInput
                          value={editJustText}
                          onChangeText={setEditJustText}
                          placeholder="Justificativa"
                          placeholderTextColor="#6B7280"
                          multiline
                          style={{ marginTop: 6, minHeight: 80, color: 'white', backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#1F2937', borderRadius: 10, padding: 10 }}
                        />
                      ) : (
                        <View style={{ marginTop: 6, backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#1F2937', borderRadius: 10, padding: 10 }}>
                          <Text style={{ color: 'white' }}>{selectedRes.justificativa || '-'}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setResModalVisible(false)} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#374151' }}>
                  <Text style={{ color: 'white' }}>Fechar</Text>
                </TouchableOpacity>

                {isAuxCoord && selectedRes?.isFixo ? (
                  <TouchableOpacity onPress={confirmarRemocao} disabled={deleting} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: deleting ? '#7f1d1d' : '#B91C1C', opacity: deleting ? 0.8 : 1 }}>
                    <Text style={{ color: 'white', fontWeight: '700' }}>{deleting ? 'Removendo...' : 'Remover fixo'}</Text>
                  </TouchableOpacity>
                ) : null}

                {isAuxCoord && selectedRes && !selectedRes.isFixo ? (
                  editJust ? (
                    <TouchableOpacity onPress={salvarJustificativa} disabled={saving} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: saving ? '#274b6b' : '#3B96E2', opacity: saving ? 0.8 : 1 }}>
                      <Text style={{ color: 'white', fontWeight: '700' }}>{saving ? 'Salvando...' : 'Salvar'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => setEditJust(true)} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#2563EB' }}>
                        <Text style={{ color: 'white', fontWeight: '700' }}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmarRemocao} disabled={deleting} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: deleting ? '#7f1d1d' : '#B91C1C', opacity: deleting ? 0.8 : 1 }}>
                        <Text style={{ color: 'white', fontWeight: '700' }}>{deleting ? 'Removendo...' : 'Remover'}</Text>
                      </TouchableOpacity>
                    </>
                  )
                ) : null}
              </View>
            </View>
          </View>
        </Modal>

        {/* Versão offscreen para captura completa */}
        {renderCapture && (
          <View
            ref={captureTableRef}
            collapsable={false}
            style={{ position: 'absolute', left: -9999, top: 0, backgroundColor: '#0B0F19' }}
          >
            {/* Cabeçalho */}
            <View style={{ flexDirection: 'row', backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#111827' }}>
              <View style={{ width: TIME_W, height: HEADER_H, borderRightWidth: 1, borderRightColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#9CA3AF', fontSize: isWeb ? 13 : 12 }}>Horário</Text>
              </View>
              {labs.map((lab) => (
                <View key={`cap-${lab.id_Laboratorio}`} style={{ width: COL_W, height: HEADER_H, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#111827' }}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: FONT_LAB }}>{lab.descricao?.trim() || `Lab ${lab.numero}`}</Text>
                </View>
              ))}
            </View>
            {/* Corpo completo sem scroll */}
            {SLOTS.map((slot, idx) => (
              <View key={`cap-row-${slot.key}`} style={{ flexDirection: 'row' }}>
                <View style={{ width: TIME_W, paddingVertical: ROW_PAD_V, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: idx % 2 ? '#0C1220' : '#0F172A' }}>
                  <Text style={{ color: '#E5E7EB', fontWeight: '700' }}>{slot.start}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{slot.end}</Text>
                </View>
                {labs.map((lab) => {
                  const key = `${lab.id_Laboratorio}-${slot.start}`;
                  const r = cellMap.get(key);
                  const rowBg = idx % 2 ? '#0C1220' : '#0F172A';
                  return (
                    <View key={`cap-cell-${key}`} style={{ width: COL_W, padding: 10, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: rowBg }}>
                      {r ? (
                        <View style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', borderRadius: 10, padding: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#1C4AED', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                              <Text style={{ color: 'white', fontWeight: '700', fontSize: 10 }}>{getInitials(r.nome_usuario)}</Text>
                            </View>
                            <Text style={{ color: 'white', fontWeight: '700', flexShrink: 1, fontSize: isWeb ? 13 : 12 }} numberOfLines={1}>{r.nome_usuario}</Text>
                            {r.isFixo ? (
                              <View style={{ marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#115e59' }}>
                                <Text style={{ color: '#34D399', fontSize: 10, fontWeight: '800' }}>FIXO</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={{ color: '#9CA3AF', marginTop: 4, fontSize: isWeb ? 12 : 12 }} numberOfLines={2}>
                            {r.isFixo ? 'Horário fixo' : (r.nome_disciplina ? `Aula de ${r.nome_disciplina}` : r.justificativa || 'Agendamento')}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ alignSelf: 'flex-start', backgroundColor: '#052e1a', borderWidth: 1, borderColor: '#16A34A', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}>
                          <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: isWeb ? 12 : 12 }}>Livre</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </Wrapper>
    </SafeAreaView>
  );
}
