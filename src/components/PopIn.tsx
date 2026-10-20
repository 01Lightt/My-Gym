import { useEffect, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

type Props = { delay?: number; style?: StyleProp<ViewStyle>; children: ReactNode };

/** Faz o conteúdo "saltar" para a tela com um quique, como os placares do Wii Sports. */
export function PopIn({ delay = 0, style, children }: Props) {
  const [progress] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }));

  useEffect(() => {
    Animated.spring(progress, {
      toValue: 1,
      delay,
      // Quique rápido que assenta em ~1 s (antes ficava balançando por vários segundos)
      speed: 16,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
  }, [progress, delay]);

  return <Animated.View style={[style, { opacity: progress, transform: [{ scale }] }]}>{children}</Animated.View>;
}
