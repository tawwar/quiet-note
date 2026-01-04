import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BorderRadius, FontSizes } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import MoodIcon from './MoodIcon';
import { MapPin } from 'lucide-react-native';

interface TagProps {
  label: string;
  type?: 'mood' | 'weather' | 'location' | 'tag';
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filled' | 'outlined';
}

export default function Tag({ label, type = 'tag', icon, selected, onPress, variant = 'outlined' }: TagProps) {
  const { theme } = useTheme();
  const isFilled = variant === 'filled' || selected;

  const renderIcon = () => {
    if (type === 'mood' || type === 'weather') {
      return <MoodIcon mood={icon || label} size={16} />;
    }
    if (type === 'location') {
      return <MapPin size={14} color={isFilled ? theme.white : theme.textSecondary} />;
    }
    return null;
  };

  return (
    <Pressable onPress={onPress}>
      <View style={[
        styles.container,
        { borderColor: theme.border, backgroundColor: theme.surface },
        isFilled && { backgroundColor: theme.surfaceSecondary, borderColor: theme.surfaceSecondary },
      ]}>
        {renderIcon()}
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  label: {
    fontSize: FontSizes.sm,
  },
});
