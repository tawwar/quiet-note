import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Lock, Pencil, Sparkles, Heart, BookOpen, Zap } from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';

const goals = [
  { id: 'mindfulness', label: 'Mindfulness', icon: Sparkles },
  { id: 'gratitude', label: 'Gratitude', icon: Heart },
  { id: 'journaling', label: 'Journaling', icon: BookOpen },
  { id: 'clarity', label: 'Clarity', icon: Zap },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { saveUserSettings } = useDatabase();
  const [name, setName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('mindfulness');

  const handleStart = async () => {
    const userName = name.trim() || 'Friend';
    await saveUserSettings(userName, selectedGoal);
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await saveUserSettings('Friend', 'journaling');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.pagination}>
              <View style={[styles.dot, styles.dotActive, { backgroundColor: theme.primary }]} />
              <View style={[styles.dot, { backgroundColor: theme.border }]} />
              <View style={[styles.dot, { backgroundColor: theme.border }]} />
            </View>
            <Pressable onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.text }]}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>Quiet Note</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              A private place to untangle your thoughts and capture your days.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.sm]}>
              <Text style={[styles.cardLabel, { color: theme.text }]}>What should we call you?</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.surfaceSecondary }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="e.g. Alex"
                  placeholderTextColor={theme.textTertiary}
                  value={name}
                  onChangeText={setName}
                />
                <Pencil size={20} color={theme.textTertiary} />
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.sm]}>
              <View style={styles.goalHeader}>
                <Sparkles size={20} color={theme.primary} />
                <Text style={[styles.cardLabel, { color: theme.text }]}>Primary Goal</Text>
              </View>
              <View style={styles.goalsGrid}>
                {goals.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  const IconComponent = goal.icon;
                  return (
                    <Pressable
                      key={goal.id}
                      style={[
                        styles.goalButton,
                        { backgroundColor: theme.surfaceSecondary, borderColor: theme.surfaceSecondary },
                        isSelected && { backgroundColor: '#E0F7F5', borderColor: theme.primary },
                      ]}
                      onPress={() => setSelectedGoal(goal.id)}
                    >
                      <IconComponent
                        size={16}
                        color={isSelected ? theme.primary : theme.textSecondary}
                      />
                      <Text style={[
                        styles.goalText,
                        { color: theme.textSecondary },
                        isSelected && { color: theme.primary },
                      ]}>
                        {goal.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable style={[styles.startButton, { backgroundColor: theme.primary }]} onPress={handleStart}>
              <Text style={[styles.startButtonText, { color: theme.white }]}>Start Writing</Text>
              <ArrowRight size={20} color={theme.white} />
            </Pressable>

            <View style={styles.privacyRow}>
              <Lock size={14} color={theme.textTertiary} />
              <Text style={[styles.privacyText, { color: theme.textTertiary }]}>Your data stays privately on your device.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  skipText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  imageContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: 260,
    borderRadius: BorderRadius.lg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.xs,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  goalText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    gap: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  privacyText: {
    fontSize: FontSizes.sm,
  },
});
