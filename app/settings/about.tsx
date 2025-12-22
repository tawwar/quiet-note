import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Shield, Lock, Palette } from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const dynamicStyles = {
    container: { ...styles.container, backgroundColor: theme.background },
    headerTitle: { ...styles.headerTitle, color: theme.text },
    logoContainer: { ...styles.logoContainer, backgroundColor: theme.primary },
    logoText: { ...styles.logoText, color: theme.white },
    appName: { ...styles.appName, color: theme.text },
    version: { ...styles.version, color: theme.textSecondary },
    sectionCard: { ...styles.sectionCard, backgroundColor: theme.surface },
    sectionTitle: { ...styles.sectionTitle, color: theme.text },
    sectionText: { ...styles.sectionText, color: theme.textSecondary },
    featureCard: { ...styles.featureCard, backgroundColor: theme.surface },
    iconContainer: { ...styles.iconContainer, backgroundColor: theme.surfaceSecondary },
    featureTitle: { ...styles.featureTitle, color: theme.text },
    featureText: { ...styles.featureText, color: theme.textSecondary },
    footer: { ...styles.footer, color: theme.textTertiary },
  };

  const features = [
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All your data stays on your device. No cloud sync, no external servers, complete privacy.',
    },
    {
      icon: Lock,
      title: 'Secure Storage',
      description: 'Your entries are stored locally and securely on your device using encrypted storage.',
    },
    {
      icon: Palette,
      title: 'Customizable',
      description: 'Personalize your journaling experience with themes, tags, and mood tracking.',
    },
    {
      icon: Heart,
      title: 'Made with Care',
      description: 'Designed to help you capture your thoughts, feelings, and memories effortlessly.',
    },
  ];

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={dynamicStyles.logoContainer}>
            <Text style={dynamicStyles.logoText}>J</Text>
          </View>
          <Text style={dynamicStyles.appName}>Personal Journal</Text>
          <Text style={dynamicStyles.version}>Version 1.0.0</Text>
        </View>

        <View style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>About This App</Text>
          <Text style={dynamicStyles.sectionText}>
            Personal Journal is a private, secure journaling app designed to help you capture your daily thoughts, memories, and experiences. Whether you want to track your mood, organize photos, or simply write down your reflections, this app provides a safe space for your personal expression.
          </Text>
        </View>

        <View style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>Key Features</Text>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <View key={index} style={dynamicStyles.featureCard}>
                <View style={dynamicStyles.iconContainer}>
                  <IconComponent size={20} color={theme.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={dynamicStyles.featureTitle}>{feature.title}</Text>
                  <Text style={dynamicStyles.featureText}>{feature.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>Open Source</Text>
          <Text style={dynamicStyles.sectionText}>
            This app is built with modern technologies including React Native, Expo, and TypeScript. We believe in transparency and user privacy above all else.
          </Text>
        </View>

        <Text style={dynamicStyles.footer}>
          Made with care for journaling enthusiasts{'\n'}
          © 2024 Personal Journal
        </Text>

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
  logoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 40,
    fontWeight: FontWeights.bold,
  },
  appName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  version: {
    fontSize: FontSizes.md,
  },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  sectionText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  featureCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: 4,
  },
  featureText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  footer: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginVertical: Spacing.xl,
    lineHeight: 20,
  },
});
