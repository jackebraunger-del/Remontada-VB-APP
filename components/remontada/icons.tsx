// Remontada – die zwei wirklich "markeneigenen" Icons, die es als fertiges
// Icon-Set (Ionicons/MaterialCommunityIcons) nicht gibt: die Münze und der
// rotierende Farbverlaufs-Ring für ausgerüstete Avatar-Rahmen. Alle anderen
// Icons kommen direkt aus @expo/vector-icons (bereits installiert).

import React, { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { RColors } from '@/constants/remontada-colors';

export function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={RColors.gold} stroke={RColors.goldStroke} strokeWidth={1} />
      <Circle cx={12} cy={12} r={6.6} stroke={RColors.goldStroke} strokeWidth={1} />
    </Svg>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Der "ausgerüstete" Rahmen-Ring aus Locker & Profile: ein Kreis mit
 * Farbverlaufs-Umrandung, der sich langsam dreht – wirkt wie ein aktiver
 * Schimmer um den Avatar.
 */
export function FrameRing({
  size = 58,
  gradientFrom = RColors.sunsetTop,
  gradientTo = RColors.sunsetBottom,
  spin = true,
}: {
  size?: number;
  gradientFrom?: string;
  gradientTo?: string;
  spin?: boolean;
}) {
  const rotation = useSharedValue(0);
  // useId() kann Doppelpunkte enthalten (z.B. ":r3:"), die in einer
  // SVG url(#id)-Referenz Probleme machen können – deshalb entfernen wir sie.
  const gradId = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    if (spin) {
      rotation.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false);
    }
    return () => cancelAnimation(rotation);
  }, [spin, rotation]);

  // Wir nutzen die eigenständige `rotation`-Prop von react-native-svg
  // (statt `transform`) – die ist als reine Zahl deutlich unkomplizierter
  // mit Reanimateds `useAnimatedProps` zu kombinieren.
  const animatedProps = useAnimatedProps(() => ({
    rotation: rotation.value,
  }));

  const r = size / 2 - 3;
  const inner = size / 2 - 5;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2={size} y2={size}>
          <Stop offset="0" stopColor={gradientFrom} />
          <Stop offset="1" stopColor={gradientTo} />
        </LinearGradient>
      </Defs>
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={`url(#${gradId})`}
        strokeWidth={3}
        fill="none"
        animatedProps={spin ? animatedProps : undefined}
        origin={`${size / 2}, ${size / 2}`}
      />
      <Circle cx={size / 2} cy={size / 2} r={inner} fill={RColors.avatarBg} />
    </Svg>
  );
}
