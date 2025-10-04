import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type Props = {
  style?: StyleProp<ViewStyle>;
};

type Status = 'idle' | 'checking' | 'online' | 'offline' | 'misconfigured';

export default function ConnectionBadge({ style }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const openProg = useRef(new Animated.Value(0)).current; // 0 fechado, 1 aberto
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(openProg, { toValue: open ? 1 : 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [open, openProg]);

  const width = openProg.interpolate({ inputRange: [0, 1], outputRange: [38, 160] });
  const height = openProg.interpolate({ inputRange: [0, 1], outputRange: [28, 44] });
  const contentOpacity = openProg.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });

  const apiUrl = ((Constants.expoConfig?.extra as any)?.API_URL as string | undefined) || process.env.EXPO_PUBLIC_API_URL;

  const testPing = useCallback(async () => {
    if (!apiUrl) {
      setStatus('misconfigured');
      setLatency(null);
      return;
    }
    setStatus('checking');
    setLatency(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const start = Date.now();
    try {
      let res = await fetch(`${apiUrl}/auth/ping`, { method: 'GET', signal: controller.signal });
      if (!res.ok) {
        // tenta rota raiz
        res = await fetch(`${apiUrl}/`, { method: 'GET', signal: controller.signal });
      }
      clearTimeout(timeout);
      if (!res.ok) throw new Error('bad');
      const ms = Date.now() - start;
      setLatency(ms);
      setStatus('online');
    } catch {
      clearTimeout(timeout);
      setStatus('offline');
      setLatency(null);
    }
  }, [apiUrl]);

  useEffect(() => {
    const t = setTimeout(() => testPing(), 500);
    return () => clearTimeout(t);
  }, [testPing]);

  const onPressIn = () => {
    Animated.timing(pressScale, { toValue: 0.96, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, tension: 140, friction: 9 }).start();
  };

  const badgeColor = status === 'online' ? '#22c55e' : status === 'checking' ? '#a78bfa' : status === 'offline' ? '#ef4444' : status === 'misconfigured' ? '#f59e0b' : 'rgba(255,255,255,0.6)';

  return (
    <Pressable
      onPress={() => {
        setOpen((v) => !v);
        if (!open) testPing();
      }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <AnimatedBlurView intensity={80} tint="dark" style={[styles.card, { width, height }]}> 
          <View style={[styles.dot, { backgroundColor: badgeColor }]} />
          <Animated.View style={[styles.row, { opacity: contentOpacity }]}> 
            <Text style={styles.text}>{labelFor(status, !!apiUrl)}</Text>
            {status === 'online' && latency != null ? (
              <Text style={[styles.text, styles.msText]}>{latency} ms</Text>
            ) : null}
          </Animated.View>
        </AnimatedBlurView>
      </Animated.View>
    </Pressable>
  );
}

function labelFor(status: Status, hasApi: boolean) {
  switch (status) {
    case 'online':
      return 'Online';
    case 'checking':
      return 'Testando…';
    case 'offline':
      return 'Offline';
    case 'misconfigured':
      return hasApi ? 'Misconfigurada' : 'Defina EXPO_PUBLIC_API_URL';
    default:
      return '—';
  }
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(17,24,39,0.6)'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: 'rgba(241,250,238,0.9)',
    fontSize: 12,
    fontWeight: '700',
  },
  msText: {
    color: 'rgba(168,164,255,0.95)'
  }
});