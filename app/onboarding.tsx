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
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';

const goals = [
  { id: 'mindfulness', label: 'Mindfulness', icon: Sparkles },
  { id: 'gratitude', label: 'Gratitude', icon: Heart },
  { id: 'journaling', label: 'Journaling', icon: BookOpen },
  { id: 'clarity', label: 'Clarity', icon: Zap },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { saveUserSettings } = useDatabase();
  const [name, setName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('mindfulness');
  const [currentPage] = useState(0);

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
    <SafeAreaView style={styles.container}>
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
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Pressable onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
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
            <Text style={styles.title}>Quiet Note</Text>
            <Text style={styles.subtitle}>
              A private place to untangle your thoughts and capture your days.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>What should we call you?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex"
                  placeholderTextColor={Colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                />
                <Pencil size={20} color={Colors.textTertiary} />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.goalHeader}>
                <Sparkles size={20} color={Colors.primary} />
                <Text style={styles.cardLabel}>Primary Goal</Text>
              </View>
              <View style={styles.goalsGrid}>
                {goals.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  const IconComponent = goal.icon;
                  return (
                    <Pressable
                      key={goal.id}
                      style={[styles.goalButton, isSelected && styles.goalButtonSelected]}
                      onPress={() => setSelectedGoal(goal.id)}
                    >
                      <IconComponent
                        size={16}
                        color={isSelected ? Colors.primary : Colors.textSecondary}
                      />
                      <Text style={[styles.goalText, isSelected && styles.goalTextSelected]}>
                        {goal.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start Writing</Text>
              <ArrowRight size={20} color={Colors.white} />
            </Pressable>

            <View style={styles.privacyRow}>
              <Lock size={14} color={Colors.textTertiary} />
              <Text style={styles.privacyText}>Your data stays privately on your device.</Text>
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.text,
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
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
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
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
  },
  goalButtonSelected: {
    backgroundColor: '#E0F7F5',
    borderColor: Colors.primary,
  },
  goalText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  goalTextSelected: {
    color: Colors.primary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    gap: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  privacyText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
  },
});
