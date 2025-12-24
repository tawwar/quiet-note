import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Shield, Lock, Palette, Github } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const dynamicStyles = {
    container: { ...styles.container, backgroundColor: theme.background },
    headerTitle: { ...styles.headerTitle, color: theme.text },
    logoGradient: { ...styles.logoGradient },
    logoImage: { ...styles.logoImage },
    appName: { ...styles.appName, color: theme.text },
    sectionCard: { ...styles.sectionCard, backgroundColor: theme.surface },
    sectionTitle: { ...styles.sectionTitle, color: theme.text },
    sectionText: { ...styles.sectionText, color: theme.textSecondary },
    featureCard: { ...styles.featureCard, backgroundColor: theme.surface },
    iconContainer: { ...styles.iconContainer, backgroundColor: theme.surfaceSecondary },
    featureTitle: { ...styles.featureTitle, color: theme.text },
    featureText: { ...styles.featureText, color: theme.textSecondary },
    footer: { ...styles.footer, color: theme.textTertiary },
    versionBadge: {
      backgroundColor: theme.surfaceSecondary,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs / 2,
      borderRadius: BorderRadius.full,
      marginTop: Spacing.xs,
    },
    versionText: {
      color: theme.primary,
      fontSize: FontSizes.xs,
      fontWeight: FontWeights.bold,
    },
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
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[theme.primary, theme.primaryDark || theme.primary]}
            style={dynamicStyles.logoGradient}
          >
            <View style={styles.logoContainerInner}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={dynamicStyles.logoImage}
                resizeMode="contain"
              />
            </View>
          </LinearGradient>
          <Text style={dynamicStyles.appName}>Quiet Note</Text>
          <View style={dynamicStyles.versionBadge}>
            <Text style={dynamicStyles.versionText}>v1.0.0</Text>
          </View>
        </View>

        <View style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>About This App</Text>
          <Text style={dynamicStyles.sectionText}>
            Quiet Note is a private, secure journaling app designed to help you capture your daily thoughts, memories, and experiences. Whether you want to track your mood, organize photos, or simply write down your reflections, this app provides a safe space for your personal expression.
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
            This app is built with modern technologies including React Native. We believe in transparency and user privacy above all else.
          </Text>
        </View>

        <View style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>Links</Text>
          <Pressable style={dynamicStyles.featureCard}>
            <View style={dynamicStyles.iconContainer}>
              <Github size={20} color={theme.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={dynamicStyles.featureTitle}>GitHub Repository</Text>
              <Text style={dynamicStyles.featureText}>View the source code and contribute</Text>
            </View>
          </Pressable>
        </View>

        <Text style={dynamicStyles.footer}>
          Made with care for journaling enthusiasts{'\n'}
          © 2025 QuietNote
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
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  logoContainerInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 65,
    height: 65,
  },
  appName: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    marginBottom: 0,
  },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
