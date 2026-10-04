import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../lib/theme';

export const TAGLINE = 'Har dukaan ka smart hisaab';

// Animated brand intro shown while the saved session loads. It sits on top of the
// app and fades out once BOTH the intro has played and the app is `ready`, then
// calls `onDone` so the parent can unmount it.
export function LoadingScreen({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  // Animated.Value = a number the native side animates without re-rendering React.
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleShift = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const [introDone, setIntroDone] = useState(false);

  // 1. Intro: logo pops in → name slides up → tagline fades in → short pause to read it.
  useEffect(() => {
    const fade = (value: Animated.Value, duration: number) =>
      Animated.timing(value, { toValue: 1, duration, useNativeDriver: true });

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.6)), // overshoots slightly, then settles — the "pop"
          useNativeDriver: true,
        }),
        fade(logoOpacity, 300),
      ]),
      Animated.stagger(150, [
        Animated.parallel([
          fade(titleOpacity, 350),
          Animated.timing(titleShift, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        fade(taglineOpacity, 350),
      ]),
      Animated.delay(400),
    ]).start(() => setIntroDone(true));
  }, [logoScale, logoOpacity, titleOpacity, titleShift, taglineOpacity]);

  // 2. Outro: once the intro has played and the app is ready, fade the whole screen away.
  useEffect(() => {
    if (!introDone || !ready) return;
    Animated.timing(screenOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => onDone());
  }, [introDone, ready, screenOpacity, onDone]);

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={require('../assets/brand/logo-mark.png')} style={styles.logo} />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleShift }] }]}>
        Dukan <Text style={{ color: colors.primary }}>Desk</Text>
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>{TAGLINE}</Animated.Text>

      {/* Only appears if loading is unusually slow — normally the intro covers it. */}
      <View style={styles.spinnerSlot}>{introDone && !ready && <ActivityIndicator color={colors.primary} />}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    // Cover the whole app underneath while it gets ready.
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  logo: { width: 112, height: 112, marginBottom: spacing.xl },
  title: { ...typography.h1, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { ...typography.bodyMuted, fontSize: 16, marginTop: spacing.sm },
  spinnerSlot: { height: 40, marginTop: spacing.xl, justifyContent: 'center' },
});
