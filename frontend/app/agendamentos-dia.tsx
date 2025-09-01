import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useFocusEffect } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

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

  const visibleTableRef = useRef<View>(null);
  const captureTableRef = useRef<View>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [labsRes, reservasRes] = await Promise.all([
        api.get<Lab[]>(`/labs/all`),
        api.get<Reserva[]>(`/agendamentos/all`),
      ]);
      setLabs(labsRes.data as any);
      const all = reservasRes.data as any as Reserva[];
      setReservas(all.filter((r) => toYMD(r.dia) === ymd));
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [ymd]);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <View style={{ flex: 1, backgroundColor: 'black', paddingTop: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8, flex: 1 }}>
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
      <View ref={visibleTableRef} style={{ marginTop: 12, marginHorizontal: 12, backgroundColor: '#0B0F19', borderRadius: 12, borderWidth: 1, borderColor: '#111827', overflow: 'hidden' }}>
        {/* Cabeçalho + corpo enrolados horizontalmente juntos */}
        <ScrollView horizontal nestedScrollEnabled directionalLockEnabled showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 12 }}>
          <View>
            {/* Cabeçalho: primeira célula vazia (horários) + colunas de laboratórios */}
            <View style={{ flexDirection: 'row', backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#111827' }}>
              {/* canto vazio */}
              <View style={{ width: 100, height: 48, borderRightWidth: 1, borderRightColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Horário</Text>
              </View>
              {labs.map((lab) => (
                <View
                  key={lab.id_Laboratorio}
                  style={{ width: 152, height: 48, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#111827' }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Lab {lab.numero}</Text>
                </View>
              ))}
            </View>

            {/* Corpo com rolagem vertical */}
            <ScrollView nestedScrollEnabled directionalLockEnabled showsVerticalScrollIndicator>
              {SLOTS.map((slot, idx) => (
                <View key={slot.key} style={{ flexDirection: 'row' }}>
                  {/* Coluna de horários */}
                  <View style={{ width: 100, paddingVertical: 14, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: idx % 2 ? '#0C1220' : '#0F172A' }}>
                    <Text style={{ color: '#E5E7EB', fontWeight: '700' }}>{slot.start}</Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{slot.end}</Text>
                  </View>

                  {/* Células por laboratório */}
                  {labs.map((lab) => {
                    const key = `${lab.id_Laboratorio}-${slot.start}`;
                    const r = cellMap.get(key);
                    const rowBg = idx % 2 ? '#0C1220' : '#0F172A';
                    return (
                      <View key={key} style={{ width: 152, padding: 8, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: rowBg }}>
                        {r ? (
                          <View style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', borderRadius: 10, padding: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#1C4AED', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                                <Text style={{ color: 'white', fontWeight: '700', fontSize: 10 }}>{getInitials(r.nome_usuario)}</Text>
                              </View>
                              <Text style={{ color: 'white', fontWeight: '700', flexShrink: 1, fontSize: 12 }} numberOfLines={1}>{r.nome_usuario}</Text>
                            </View>
                            <Text style={{ color: '#9CA3AF', marginTop: 4, fontSize: 12 }} numberOfLines={2}>
                              {r.nome_disciplina ? `Aula de ${r.nome_disciplina}` : r.justificativa || 'Agendamento'}
                            </Text>
                          </View>
                        ) : (
                          <View style={{ alignSelf: 'flex-start', backgroundColor: '#052e1a', borderWidth: 1, borderColor: '#16A34A', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 }}>
                            <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: 12 }}>Livre</Text>
                          </View>
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

      {/* Versão offscreen para captura completa */}
      {renderCapture && (
        <View
          ref={captureTableRef}
          collapsable={false}
          style={{ position: 'absolute', left: -9999, top: 0, backgroundColor: '#0B0F19' }}
        >
          {/* Cabeçalho */}
          <View style={{ flexDirection: 'row', backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#111827' }}>
            <View style={{ width: 100, height: 48, borderRightWidth: 1, borderRightColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Horário</Text>
            </View>
            {labs.map((lab) => (
              <View key={`cap-${lab.id_Laboratorio}`} style={{ width: 152, height: 48, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#111827' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Lab {lab.numero}</Text>
              </View>
            ))}
          </View>
          {/* Corpo completo sem scroll */}
          {SLOTS.map((slot, idx) => (
            <View key={`cap-row-${slot.key}`} style={{ flexDirection: 'row' }}>
              <View style={{ width: 100, paddingVertical: 14, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: idx % 2 ? '#0C1220' : '#0F172A' }}>
                <Text style={{ color: '#E5E7EB', fontWeight: '700' }}>{slot.start}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{slot.end}</Text>
              </View>
              {labs.map((lab) => {
                const key = `${lab.id_Laboratorio}-${slot.start}`;
                const r = cellMap.get(key);
                const rowBg = idx % 2 ? '#0C1220' : '#0F172A';
                return (
                  <View key={`cap-cell-${key}`} style={{ width: 152, padding: 8, borderRightWidth: 1, borderRightColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: rowBg }}>
                    {r ? (
                      <View style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937', borderRadius: 10, padding: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#1C4AED', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 10 }}>{getInitials(r.nome_usuario)}</Text>
                          </View>
                          <Text style={{ color: 'white', fontWeight: '700', flexShrink: 1, fontSize: 12 }} numberOfLines={1}>{r.nome_usuario}</Text>
                        </View>
                        <Text style={{ color: '#9CA3AF', marginTop: 4, fontSize: 12 }} numberOfLines={2}>
                          {r.nome_disciplina ? `Aula de ${r.nome_disciplina}` : r.justificativa || 'Agendamento'}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ alignSelf: 'flex-start', backgroundColor: '#052e1a', borderWidth: 1, borderColor: '#16A34A', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 }}>
                        <Text style={{ color: '#22C55E', fontWeight: '700', fontSize: 12 }}>Livre</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
