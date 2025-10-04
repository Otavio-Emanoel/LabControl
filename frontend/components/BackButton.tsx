import React, { useState } from 'react';
import { Text, StyleSheet, GestureResponderEvent, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface BackButtonProps {
  to?: string;              // rota destino opcional
  label?: string;           // texto opcional
  onPress?: (e: GestureResponderEvent) => void; // ação custom
  variant?: 'glass' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle | ViewStyle[];
}

const variantStyles = {
  glass: {
    gradient: ['#1e293bAA', '#0f172a99'],
    borderColor: '#ffffff30',
    text: { color: '#F1F5F9' },
    icon: '#F8FAFC',
  },
  solid: {
    gradient: ['#2563EB', '#1D4ED8'],
    borderColor: '#1E3A8A',
    text: { color: '#FFFFFF' },
    icon: '#FFFFFF',
  },
  outline: {
    gradient: ['#0f172a', '#0f172a'],
    borderColor: '#3B96E2',
    text: { color: '#3B96E2' },
    icon: '#3B96E2',
  },
} as const;

const sizeStyles = {
  sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    gap: 6,
    icon: 16,
  },
  md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    gap: 8,
    icon: 18,
  },
};

export default function BackButton({ to, label = 'Voltar', onPress, variant = 'glass', size = 'sm', style }: BackButtonProps) {
  const router = useRouter();
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const [hovered, setHovered] = useState(false);

  const handlePress = (e: GestureResponderEvent) => {
    if (onPress) return onPress(e);
    if (to) return router.push(to as any);
    // fallback: se houver histórico
    try { router.back(); } catch { router.push('/'); }
  };

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.wrapper,
        {
          transform: [{ translateY: pressed ? 1 : 0 }],
          opacity: pressed ? 0.92 : 1,
        },
        style as any,
      ]}
      hitSlop={8}
    >
      <LinearGradient
        colors={v.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.base,
          {
            paddingVertical: s.paddingVertical,
            paddingHorizontal: s.paddingHorizontal,
            flexDirection: 'row',
            gap: s.gap,
            borderColor: v.borderColor,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOpacity: hovered ? 0.35 : 0.22,
            shadowRadius: hovered ? 10 : 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: hovered ? 7 : 4,
            backgroundColor: 'transparent',
          },
        ]}
      >
        <Ionicons name="arrow-back" size={s.icon} color={v.icon} style={{ marginRight: 4, opacity: hovered ? 1 : 0.95 }} />
        <Text
          style={[
            styles.text,
            { fontSize: s.fontSize },
            v.text,
            { letterSpacing: 0.5, opacity: hovered ? 1 : 0.95 },
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  base: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
