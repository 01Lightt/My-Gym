import { useRef } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  /** Visual do botão (borda, sombra...) — é a parte que quica. */
  style?: StyleProp<ViewStyle>;
  /** Posicionamento do botão no layout (ex.: flex: 1). */
  containerStyle?: StyleProp<ViewStyle>;
};

/** Botão que "afunda" e quica ao ser tocado, como os botões do Wii. */
export function BouncyPressable({
  style,
  containerStyle,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 12 }).start();

  return (
    <Pressable
      style={containerStyle}
      onPressIn={(e) => {
        animateTo(0.93);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      {...rest}>
      {(state) => (
        <Animated.View style={[style, { transform: [{ scale }] }]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
