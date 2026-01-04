import React from 'react';
import { Smile, Frown, Meh, Sun, Cloud, CloudRain, Zap, Heart, Sparkles, Coffee } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface MoodIconProps {
  mood: string;
  size?: number;
  color?: string;
}

const moodIcons: Record<string, { icon: React.FC<any>; color: string }> = {
  happy: { icon: Smile, color: '#FBBF24' },
  sad: { icon: Frown, color: '#60A5FA' },
  neutral: { icon: Meh, color: '#9CA3AF' },
  anxious: { icon: CloudRain, color: '#94A3B8' },
  excited: { icon: Zap, color: '#F59E0B' },
  grateful: { icon: Heart, color: '#EC4899' },
  peaceful: { icon: Sparkles, color: '#A78BFA' },
  tired: { icon: Coffee, color: '#78716C' },
};

const weatherIcons: Record<string, { icon: React.FC<any>; color: string }> = {
  sunny: { icon: Sun, color: '#FBBF24' },
  cloudy: { icon: Cloud, color: '#9CA3AF' },
  rainy: { icon: CloudRain, color: '#60A5FA' },
};

export default function MoodIcon({ mood, size = 24, color }: MoodIconProps) {
  const { theme } = useTheme();
  const moodData = moodIcons[mood.toLowerCase()] || weatherIcons[mood.toLowerCase()];

  if (!moodData) {
    return <Smile size={size} color={color || theme.textSecondary} />;
  }

  const IconComponent = moodData.icon;
  return <IconComponent size={size} color={color || moodData.color} />;
}
