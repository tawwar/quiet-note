import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Hash,
  Smile,
  Bold,
  Italic,
  List,
  Image as ImageIcon,
  Mic,
  Camera,
  Images,
  Frown,
  CloudRain,
  Sparkles,
  Heart,
  Zap,
  Meh,
  Play,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import FAB from '@/components/FAB';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
}

const moods = [
  { id: 'happy', label: 'Happy', icon: Smile, color: '#FFD700' },
  { id: 'sad', label: 'Sad', icon: Frown, color: '#6B7280' },
  { id: 'anxious', label: 'Anxious', icon: CloudRain, color: '#3B82F6' },
  { id: 'peaceful', label: 'Peaceful', icon: Sparkles, color: '#8B5CF6' },
  { id: 'grateful', label: 'Grateful', icon: Heart, color: '#EF4444' },
  { id: 'excited', label: 'Excited', icon: Zap, color: '#F59E0B' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: '#9CA3AF' },
];

export default function NewEntryScreen() {
  const router = useRouter();
  const { createEntry, addMedia } = useDatabase();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const selectedMood = moods.find((m) => m.id === mood);

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && mediaItems.length === 0) {
      return;
    }

    const entryId = await createEntry({
      title: title.trim() || 'Untitled Entry',
      content: content.trim(),
      mood,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
    });

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      await addMedia({
        entryId,
        type: item.type,
        uri: item.uri,
        width: item.width || null,
        height: item.height || null,
        duration: item.duration || null,
        order: i,
      });
    }

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSelectMood = (selectedMoodId: string) => {
    setMood(selectedMoodId);
    setShowMoodPicker(false);
  };

  const handleCamera = async () => {
    setShowFabMenu(false);

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaItems((prev) => [
          ...prev,
          {
            uri: asset.uri,
            type: asset.type === 'video' ? 'video' : 'image',
            width: asset.width,
            height: asset.height,
            duration: asset.duration || undefined,
          },
        ]);
      }
    } catch (error) {
      console.warn('Camera error:', error);
    }
  };

  const handleGallery = async () => {
    setShowFabMenu(false);

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library access is needed to select photos.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newItems = result.assets.map((asset) => ({
          uri: asset.uri,
          type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
          width: asset.width,
          height: asset.height,
          duration: asset.duration || undefined,
        }));
        setMediaItems((prev) => [...prev, ...newItems]);
      }
    } catch (error) {
      console.warn('Gallery error:', error);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.tagsRow}>
        <Pressable style={styles.tagButton} onPress={() => setShowTagInput(true)}>
          <Hash size={16} color={Colors.textSecondary} />
          <Text style={styles.tagButtonText}>ADD TAG</Text>
        </Pressable>
        <Pressable
          style={[styles.tagButton, mood && styles.tagButtonActive]}
          onPress={() => setShowMoodPicker(true)}
        >
          {selectedMood ? (
            <selectedMood.icon size={16} color={selectedMood.color} />
          ) : (
            <Smile size={16} color={Colors.textSecondary} />
          )}
          <Text style={[styles.tagButtonText, mood && styles.tagButtonTextActive]}>
            {selectedMood ? selectedMood.label.toUpperCase() : 'ADD EMOTION'}
          </Text>
        </Pressable>
      </View>

      {tags.length > 0 && (
        <View style={styles.selectedTags}>
          {tags.map((tag) => (
            <Pressable key={tag} style={styles.selectedTag} onPress={() => handleRemoveTag(tag)}>
              <Text style={styles.selectedTagText}>#{tag}</Text>
              <X size={14} color={Colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="Title your day..."
          placeholderTextColor={Colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          multiline
        />

        <TextInput
          style={styles.contentInput}
          placeholder="What's on your mind today? Start writing..."
          placeholderTextColor={Colors.textTertiary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {mediaItems.length > 0 && (
          <View style={styles.mediaGrid}>
            {mediaItems.map((item, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                {item.type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <Play size={24} color={Colors.white} fill={Colors.white} />
                  </View>
                )}
                <Pressable style={styles.removeMediaButton} onPress={() => handleRemoveMedia(index)}>
                  <X size={16} color={Colors.white} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 200 }} />
      </ScrollView>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolButton}>
          <Bold size={22} color={Colors.text} />
        </Pressable>
        <Pressable style={styles.toolButton}>
          <Italic size={22} color={Colors.text} />
        </Pressable>
        <Pressable style={styles.toolButton}>
          <List size={22} color={Colors.text} />
        </Pressable>
        <Pressable style={styles.toolButton} onPress={() => setShowFabMenu(true)}>
          <ImageIcon size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.toolDivider} />
        <Pressable style={styles.toolButton}>
          <Mic size={22} color={Colors.text} />
        </Pressable>
      </View>

      <FAB onPress={() => setShowFabMenu(true)} style={styles.fab} />

      <Modal
        visible={showFabMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFabMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFabMenu(false)}>
          <Pressable style={styles.fabMenu} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.fabMenuItem} onPress={handleCamera}>
              <View style={styles.fabMenuIcon}>
                <Camera size={24} color={Colors.primary} />
              </View>
              <Text style={styles.fabMenuText}>Take Photo/Video</Text>
            </Pressable>
            <Pressable style={styles.fabMenuItem} onPress={handleGallery}>
              <View style={styles.fabMenuIcon}>
                <Images size={24} color={Colors.primary} />
              </View>
              <Text style={styles.fabMenuText}>Choose from Gallery</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showMoodPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoodPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMoodPicker(false)}>
          <Pressable style={styles.moodPicker} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.moodPickerTitle}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {moods.map((m) => {
                const IconComponent = m.icon;
                const isSelected = mood === m.id;
                return (
                  <Pressable
                    key={m.id}
                    style={[styles.moodItem, isSelected && styles.moodItemSelected]}
                    onPress={() => handleSelectMood(m.id)}
                  >
                    <IconComponent
                      size={28}
                      color={isSelected ? m.color : Colors.textSecondary}
                    />
                    <Text
                      style={[styles.moodLabel, isSelected && { color: m.color, fontWeight: FontWeights.medium }]}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showTagInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTagInput(false)}
      >
        <Pressable style={styles.tagModalOverlay} onPress={() => setShowTagInput(false)}>
          <Pressable style={styles.tagInputModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.tagInputTitle}>Add a tag</Text>
            <TextInput
              style={styles.tagTextInput}
              placeholder="Enter tag name"
              placeholderTextColor={Colors.textTertiary}
              value={newTag}
              onChangeText={setNewTag}
              autoFocus
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <View style={styles.tagInputButtons}>
              <Pressable
                style={styles.tagInputCancel}
                onPress={() => {
                  setNewTag('');
                  setShowTagInput(false);
                }}
              >
                <Text style={styles.tagInputCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.tagInputAdd} onPress={handleAddTag}>
                <Text style={styles.tagInputAddText}>Add</Text>
              </Pressable>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cancelText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  headerCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  timeText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  saveText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  tagsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  tagButtonActive: {
    borderColor: Colors.primary,
    borderStyle: 'solid',
    backgroundColor: '#E0F7F5',
  },
  tagButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  tagButtonTextActive: {
    color: Colors.primary,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  selectedTagText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  contentInput: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    minHeight: 150,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  mediaItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  toolButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  toolDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  tagModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabMenu: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  fabMenuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenuText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: FontWeights.medium,
  },
  moodPicker: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
  },
  moodPickerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  moodItem: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceSecondary,
    width: '30%',
  },
  moodItemSelected: {
    backgroundColor: '#E0F7F5',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  moodLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  tagInputModal: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  tagInputTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tagTextInput: {
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  tagInputButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  tagInputCancel: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  tagInputCancelText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  tagInputAdd: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tagInputAddText: {
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: FontWeights.medium,
  },
});
