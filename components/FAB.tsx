import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { Shadows } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FAB({ onPress, style, size = 56 }: FABProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.primary },
        animatedStyle,
        style,
      ]}
    >
      <Plus size={28} color={theme.white} strokeWidth={2.5} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
