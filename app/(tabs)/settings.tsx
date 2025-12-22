import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Bell,
  Lock,
  Palette,
  Download,
  HelpCircle,
  ChevronRight,
  Shield,
  Moon,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
} from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, toggleTheme } = useTheme();
  const { userSettings, saveUserSettings, entries, albums } = useDatabase();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editName, setEditName] = useState(userSettings?.name || '');
  const [editGoal, setEditGoal] = useState(userSettings?.primaryGoal || 'Journaling');
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const goals = ['Mindfulness', 'Gratitude', 'Journaling', 'Clarity', 'Self-Reflection', 'Creativity'];

  const handleSaveProfile = async () => {
    if (editName.trim()) {
      await saveUserSettings(editName.trim(), editGoal);
      setShowProfileModal(false);
    }
  };

  const handleExportData = async () => {
    const exportData = {
      userSettings,
      entries,
      albums,
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    if (Platform.OS === 'web') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Alert.alert('Export Complete', 'Your journal data has been downloaded.');
    } else {
      Alert.alert(
        'Export Data',
        `Your journal contains ${entries.length} entries and ${albums.length} albums. Export feature saves data to your device.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Data Cleared', 'All local data has been cleared. Please restart the app.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data. Please try again.');
    }
    setShowDeleteModal(false);
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          onPress: () => {
            setEditName(userSettings?.name || '');
            setEditGoal(userSettings?.primaryGoal || 'Journaling');
            setShowProfileModal(true);
          },
        },
        {
          icon: Bell,
          label: 'Daily Reminder',
          toggle: true,
          value: dailyReminder,
          onToggle: setDailyReminder,
        },
        {
          icon: Lock,
          label: 'App Lock',
          subtitle: 'Require authentication to open',
          onPress: () => Alert.alert('App Lock', 'This feature requires a native build with biometric authentication.'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Moon,
          label: 'Dark Mode',
          toggle: true,
          value: themeMode === 'dark',
          onToggle: toggleTheme,
        },
        {
          icon: Bell,
          label: 'Push Notifications',
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: ImageIcon,
          label: 'Default Photo Quality',
          subtitle: 'High quality',
          onPress: () => Alert.alert('Photo Quality', 'Photos are saved in high quality (80%).'),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: Download,
          label: 'Export Journal',
          subtitle: `${entries.length} entries, ${albums.length} albums`,
          onPress: handleExportData,
        },
        {
          icon: Shield,
          label: 'Auto Backup',
          subtitle: autoBackup ? 'Enabled' : 'Disabled',
          toggle: true,
          value: autoBackup,
          onToggle: setAutoBackup,
        },
        {
          icon: Trash2,
          label: 'Clear All Data',
          subtitle: 'Delete all journal data',
          danger: true,
          onPress: () => setShowDeleteModal(true),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & FAQ',
          onPress: () => router.push('/settings/help'),
        },
        {
          icon: Palette,
          label: 'About',
          subtitle: 'Version 1.0.0',
          onPress: () => router.push('/settings/about'),
        },
      ],
    },
  ];

  const dynamicStyles = {
    container: { ...styles.container, backgroundColor: theme.background },
    title: { ...styles.title, color: theme.text },
    profileCard: { ...styles.profileCard, backgroundColor: theme.surface },
    avatar: { ...styles.avatar, backgroundColor: theme.primary },
    avatarText: { ...styles.avatarText, color: theme.white },
    profileName: { ...styles.profileName, color: theme.text },
    profileGoal: { ...styles.profileGoal, color: theme.textSecondary },
    groupTitle: { ...styles.groupTitle, color: theme.textSecondary },
    groupCard: { ...styles.groupCard, backgroundColor: theme.surface },
    settingsItemBorder: { ...styles.settingsItemBorder, borderBottomColor: theme.borderLight },
    iconContainer: { ...styles.iconContainer, backgroundColor: theme.surfaceSecondary },
    settingsLabel: { ...styles.settingsLabel, color: theme.text },
    settingsLabelDanger: { ...styles.settingsLabelDanger, color: theme.error },
    settingsSubtitle: { ...styles.settingsSubtitle, color: theme.textSecondary },
    footerText: { ...styles.footerText, color: theme.textTertiary },
    modal: { ...styles.modal, backgroundColor: theme.surface },
    modalTitle: { ...styles.modalTitle, color: theme.text },
    inputLabel: { ...styles.inputLabel, color: theme.textSecondary },
    input: { ...styles.input, borderColor: theme.border, color: theme.text },
    goalChip: { ...styles.goalChip, backgroundColor: theme.surfaceSecondary },
    goalChipActive: { ...styles.goalChipActive, backgroundColor: theme.primary },
    goalChipText: { ...styles.goalChipText, color: theme.textSecondary },
    goalChipTextActive: { ...styles.goalChipTextActive, color: theme.white },
    saveButton: { ...styles.saveButton, backgroundColor: theme.primary },
    saveButtonText: { ...styles.saveButtonText, color: theme.white },
    deleteTitle: { ...styles.deleteTitle, color: theme.text },
    deleteText: { ...styles.deleteText, color: theme.textSecondary },
    cancelButton: { ...styles.cancelButton, borderColor: theme.border },
    cancelButtonText: { ...styles.cancelButtonText, color: theme.textSecondary },
    deleteButton: { ...styles.deleteButton, backgroundColor: theme.error },
    deleteButtonText: { ...styles.deleteButtonText, color: theme.white },
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>Settings</Text>
        </View>

        <Pressable style={dynamicStyles.profileCard} onPress={() => {
          setEditName(userSettings?.name || '');
          setEditGoal(userSettings?.primaryGoal || 'Journaling');
          setShowProfileModal(true);
        }}>
          <View style={dynamicStyles.avatar}>
            <Text style={dynamicStyles.avatarText}>
              {userSettings?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={dynamicStyles.profileName}>{userSettings?.name || 'User'}</Text>
            <Text style={dynamicStyles.profileGoal}>
              Goal: {userSettings?.primaryGoal || 'Journaling'}
            </Text>
          </View>
          <ChevronRight size={20} color={theme.textTertiary} />
        </Pressable>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={dynamicStyles.groupTitle}>{group.title}</Text>
            <View style={dynamicStyles.groupCard}>
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <Pressable
                    key={itemIndex}
                    style={[
                      styles.settingsItem,
                      itemIndex < group.items.length - 1 && dynamicStyles.settingsItemBorder,
                    ]}
                    onPress={item.onPress}
                    disabled={item.toggle}
                  >
                    <View style={styles.settingsItemLeft}>
                      <View style={[dynamicStyles.iconContainer, item.danger && styles.iconContainerDanger]}>
                        <IconComponent size={20} color={item.danger ? theme.error : theme.primary} />
                      </View>
                      <View>
                        <Text style={[dynamicStyles.settingsLabel, item.danger && dynamicStyles.settingsLabelDanger]}>
                          {item.label}
                        </Text>
                        {item.subtitle && (
                          <Text style={dynamicStyles.settingsSubtitle}>{item.subtitle}</Text>
                        )}
                      </View>
                    </View>
                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: theme.border, true: theme.primaryLight }}
                        thumbColor={item.value ? theme.primary : theme.white}
                      />
                    ) : (
                      <ChevronRight size={20} color={theme.textTertiary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={dynamicStyles.footerText}>Your data stays privately on your device</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowProfileModal(false)}>
          <Pressable style={dynamicStyles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setShowProfileModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <Text style={dynamicStyles.inputLabel}>Name</Text>
            <TextInput
              style={dynamicStyles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={theme.textTertiary}
            />

            <Text style={dynamicStyles.inputLabel}>Primary Goal</Text>
            <View style={styles.goalsGrid}>
              {goals.map((goal) => (
                <Pressable
                  key={goal}
                  style={[dynamicStyles.goalChip, editGoal === goal && dynamicStyles.goalChipActive]}
                  onPress={() => setEditGoal(goal)}
                >
                  <Text style={[dynamicStyles.goalChipText, editGoal === goal && dynamicStyles.goalChipTextActive]}>
                    {goal}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={dynamicStyles.saveButton} onPress={handleSaveProfile}>
              <Check size={20} color={theme.white} />
              <Text style={dynamicStyles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <Pressable style={dynamicStyles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModalContent}>
              <View style={styles.deleteIconContainer}>
                <Trash2 size={32} color={theme.error} />
              </View>
              <Text style={dynamicStyles.deleteTitle}>Clear All Data?</Text>
              <Text style={dynamicStyles.deleteText}>
                This will permanently delete all your journal entries, albums, and settings.
                This action cannot be undone.
              </Text>
              <View style={styles.deleteButtons}>
                <Pressable
                  style={dynamicStyles.cancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={dynamicStyles.deleteButton} onPress={handleClearData}>
                  <Trash2 size={18} color={theme.white} />
                  <Text style={dynamicStyles.deleteButtonText}>Delete All</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  profileGoal: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  settingsGroup: {
    marginBottom: Spacing.lg,
  },
  groupTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginLeft: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconContainerDanger: {
    backgroundColor: '#FEE2E2',
  },
  settingsLabel: {
    fontSize: FontSizes.md,
  },
  settingsLabelDanger: {
  },
  settingsSubtitle: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSizes.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs,
  },
  input: {
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  goalChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  goalChipActive: {
  },
  goalChipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  goalChipTextActive: {
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  deleteModalContent: {
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  deleteTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  deleteText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  deleteButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
});
