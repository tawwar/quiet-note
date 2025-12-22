import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import MoodIcon from './MoodIcon';
import { MapPin, Hash } from 'lucide-react-native';

interface TagProps {
  label: string;
  type?: 'mood' | 'weather' | 'location' | 'tag';
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filled' | 'outlined';
}

export default function Tag({ label, type = 'tag', icon, selected, onPress, variant = 'outlined' }: TagProps) {
  const isFilled = variant === 'filled' || selected;

  const renderIcon = () => {
    if (type === 'mood' || type === 'weather') {
      return <MoodIcon mood={icon || label} size={16} />;
    }
    if (type === 'location') {
      return <MapPin size={14} color={isFilled ? Colors.white : Colors.textSecondary} />;
    }
    return null;
  };

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.container, isFilled && styles.filled]}>
        {renderIcon()}
        <Text style={[styles.label, isFilled && styles.labelFilled]}>{label}</Text>
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
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filled: {
    backgroundColor: Colors.surfaceSecondary,
    borderColor: Colors.surfaceSecondary,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  labelFilled: {
    color: Colors.text,
  },
});
