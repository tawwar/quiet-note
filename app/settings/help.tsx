import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function HelpScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const dynamicStyles = {
    container: { ...styles.container, backgroundColor: theme.background },
    headerTitle: { ...styles.headerTitle, color: theme.text },
    sectionTitle: { ...styles.sectionTitle, color: theme.text },
    questionCard: { ...styles.questionCard, backgroundColor: theme.surface },
    questionText: { ...styles.questionText, color: theme.text },
    answerText: { ...styles.answerText, color: theme.textSecondary },
  };

  const faqs = [
    {
      question: 'How do I create a new journal entry?',
      answer:
        'Tap the floating action button (plus icon) at the bottom of the Journal screen. You can add text, photos, videos, tags, and mood indicators to your entry.',
    },
    {
      question: 'How do I add photos or videos to my entry?',
      answer:
        'When creating or editing an entry, tap the camera icon to take a photo/video or tap the gallery icon to choose from your device gallery.',
    },
    {
      question: 'Can I organize my entries with tags?',
      answer:
        'Yes! When creating an entry, tap "Add Tag" to create custom tags. You can add multiple tags to each entry to help organize your journal.',
    },
    {
      question: 'How do I track my mood?',
      answer:
        'While creating an entry, tap "Add Emotion" to select a mood that represents how you were feeling. This helps you track your emotional patterns over time.',
    },
    {
      question: 'What are Albums and how do I use them?',
      answer:
        'Albums let you organize your media (photos and videos) into collections. Go to the Albums tab and create a new album to start organizing your memories.',
    },
    {
      question: 'How do I search for entries?',
      answer:
        'Use the search icon on the Journal screen to search through your entries by title, content, tags, or mood. Results appear instantly as you type.',
    },
    {
      question: 'Can I export my journal data?',
      answer:
        'Yes! Go to Settings > Export Journal to download all your entries and albums as a JSON file. This creates a backup you can save.',
    },
    {
      question: 'Is my data stored securely?',
      answer:
        'All your data stays privately on your device. Nothing is sent to external servers. Your journal entries, photos, and personal information remain completely private.',
    },
    {
      question: 'How do I enable dark mode?',
      answer:
        'Go to Settings and toggle the Dark Mode switch under Preferences. The app will immediately switch to a dark color scheme.',
    },
    {
      question: 'Can I edit or delete an entry?',
      answer:
        'Yes! Tap on any entry to open it, then use the edit or delete options. You can also mark entries as favorites for quick access.',
    },
  ];

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Help & FAQ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={dynamicStyles.sectionTitle}>Frequently Asked Questions</Text>

        {faqs.map((faq, index) => (
          <View key={index} style={dynamicStyles.questionCard}>
            <Text style={dynamicStyles.questionText}>{faq.question}</Text>
            <Text style={dynamicStyles.answerText}>{faq.answer}</Text>
          </View>
        ))}

        <View style={dynamicStyles.questionCard}>
          <Text style={dynamicStyles.questionText}>Need more help?</Text>
          <Text style={dynamicStyles.answerText}>
            If you have questions that aren't answered here, please check our documentation or contact support. We're here to help you make the most of your journaling experience.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  questionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  questionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  answerText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
});
