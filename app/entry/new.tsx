import React, { useState, useRef, useEffect } from 'react';
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
  KeyboardAvoidingView,
  InputAccessoryView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Hash,
  Smile,
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
import { Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';
import FAB from '@/components/FAB';
import RichTextEditor, { RichTextEditorRef } from '@/components/RichTextEditor';
import FormattingToolbar from '@/components/FormattingToolbar';
import type { OnChangeStateEvent } from 'react-native-enriched';

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

const INPUT_ACCESSORY_VIEW_ID = 'richTextToolbar';

export default function NewEntryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { createEntry, addMedia } = useDatabase();
  const editorRef = useRef<RichTextEditorRef>(null);
  
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(null);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const showToolbar = isContentFocused && isKeyboardVisible;

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
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please add a title for your entry before saving.');
      return;
    }
    
    const contentHtml = await editorRef.current?.getHtml();

    const entryId = await createEntry({
      title: title.trim(),
      content: contentHtml || null,
      mood,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
    });

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      await addMedia({
        entryId,
        type: item.type,
        uri: item.uri,
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

  const renderToolbar = () => (
    <FormattingToolbar
      stylesState={stylesState}
      onBold={() => editorRef.current?.toggleBold()}
      onItalic={() => editorRef.current?.toggleItalic()}
      onUnderline={() => editorRef.current?.toggleUnderline()}
      onStrikethrough={() => editorRef.current?.toggleStrikethrough()}
      onBulletList={() => editorRef.current?.toggleBulletList()}
      onOrderedList={() => editorRef.current?.toggleOrderedList()}
    />
  );

  const renderContent = () => (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Pressable onPress={handleCancel}>
          <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.dateText, { color: theme.text }]}>{dateStr}</Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>{timeStr}</Text>
        </View>
        <Pressable style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Text style={[styles.saveText, { color: theme.white }]}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.tagsRow}>
        <Pressable style={[styles.tagButton, { borderColor: theme.border }]} onPress={() => setShowTagInput(true)}>
          <Hash size={16} color={theme.textSecondary} />
          <Text style={[styles.tagButtonText, { color: theme.textSecondary }]}>ADD TAG</Text>
        </Pressable>
        <Pressable
          style={[
            styles.tagButton,
            { borderColor: theme.border },
            mood && { borderColor: theme.primary, borderStyle: 'solid', backgroundColor: '#E0F7F5' },
          ]}
          onPress={() => setShowMoodPicker(true)}
        >
          {selectedMood ? (
            <selectedMood.icon size={16} color={selectedMood.color} />
          ) : (
            <Smile size={16} color={theme.textSecondary} />
          )}
          <Text style={[
            styles.tagButtonText,
            { color: theme.textSecondary },
            mood && { color: theme.primary },
          ]}>
            {selectedMood ? selectedMood.label.toUpperCase() : 'ADD EMOTION'}
          </Text>
        </Pressable>
      </View>

      {tags.length > 0 && (
        <View style={styles.selectedTags}>
          {tags.map((tag) => (
            <Pressable key={tag} style={[styles.selectedTag, { backgroundColor: theme.surfaceSecondary }]} onPress={() => handleRemoveTag(tag)}>
              <Text style={[styles.selectedTagText, { color: theme.text }]}>#{tag}</Text>
              <X size={14} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.titleContainer}>
        <TextInput
          style={[styles.titleInput, { color: theme.text }]}
          placeholder="Title your day..."
          placeholderTextColor={theme.textTertiary}
          value={title}
          onChangeText={setTitle}
          multiline
        />
      </View>

      <View style={styles.editorContainer}>
        <RichTextEditor
          ref={editorRef}
          placeholder="What's on your mind today? Start writing..."
          onChangeState={setStylesState}
          onFocus={() => setIsContentFocused(true)}
          onBlur={() => setIsContentFocused(false)}
        />
      </View>

      {mediaItems.length > 0 && (
        <ScrollView 
          horizontal 
          style={styles.mediaScrollView}
          showsHorizontalScrollIndicator={true}
        >
          {mediaItems.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              <Image source={{ uri: item.uri }} style={styles.mediaImage} />
              {item.type === 'video' && (
                <View style={styles.videoOverlay}>
                  <Play size={24} color={theme.white} fill={theme.white} />
                </View>
              )}
              <Pressable style={styles.removeMediaButton} onPress={() => handleRemoveMedia(index)}>
                <X size={16} color={theme.white} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <FAB onPress={() => setShowFabMenu(true)} style={styles.fab} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {Platform.OS === 'ios' ? (
        <>
          {renderContent()}
          <InputAccessoryView nativeID={INPUT_ACCESSORY_VIEW_ID}>
            {showToolbar && renderToolbar()}
          </InputAccessoryView>
        </>
      ) : (
        <KeyboardAvoidingView style={styles.keyboardAvoid} behavior="padding">
          {renderContent()}
          {showToolbar && renderToolbar()}
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={showFabMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFabMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFabMenu(false)}>
          <Pressable style={[styles.fabMenu, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.fabMenuItem} onPress={handleCamera}>
              <View style={[styles.fabMenuIcon, { backgroundColor: theme.surfaceSecondary }]}>
                <Camera size={24} color={theme.primary} />
              </View>
              <Text style={[styles.fabMenuText, { color: theme.text }]}>Take Photo/Video</Text>
            </Pressable>
            <Pressable style={styles.fabMenuItem} onPress={handleGallery}>
              <View style={[styles.fabMenuIcon, { backgroundColor: theme.surfaceSecondary }]}>
                <Images size={24} color={theme.primary} />
              </View>
              <Text style={[styles.fabMenuText, { color: theme.text }]}>Choose from Gallery</Text>
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
          <Pressable style={[styles.moodPicker, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.moodPickerTitle, { color: theme.text }]}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {moods.map((m) => {
                const IconComponent = m.icon;
                const isSelected = mood === m.id;
                return (
                  <Pressable
                    key={m.id}
                    style={[
                      styles.moodItem,
                      { backgroundColor: theme.surfaceSecondary },
                      isSelected && { backgroundColor: '#E0F7F5', borderWidth: 1, borderColor: theme.primary },
                    ]}
                    onPress={() => handleSelectMood(m.id)}
                  >
                    <IconComponent
                      size={28}
                      color={isSelected ? m.color : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.moodLabel,
                        { color: theme.textSecondary },
                        isSelected && { color: m.color, fontWeight: FontWeights.medium },
                      ]}
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
          <Pressable style={[styles.tagInputModal, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.tagInputTitle, { color: theme.text }]}>Add a tag</Text>
            <TextInput
              style={[styles.tagTextInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Enter tag name"
              placeholderTextColor={theme.textTertiary}
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
                <Text style={[styles.tagInputCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.tagInputAdd, { backgroundColor: theme.primary }]} onPress={handleAddTag}>
                <Text style={[styles.tagInputAddText, { color: theme.white }]}>Add</Text>
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
  },
  keyboardAvoid: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
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
  },
  headerCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  timeText: {
    fontSize: FontSizes.sm,
  },
  saveButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  saveText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
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
    borderStyle: 'dashed',
  },
  tagButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  selectedTagText: {
    fontSize: FontSizes.sm,
  },
  titleContainer: {
    paddingHorizontal: Spacing.lg,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: FontWeights.bold,
    paddingVertical: Spacing.sm,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  mediaScrollView: {
    maxHeight: 120,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenuText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  moodPicker: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
  },
  moodPickerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
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
    width: '30%',
  },
  moodLabel: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  tagInputModal: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  tagInputTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  tagTextInput: {
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
  },
  tagInputAdd: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tagInputAddText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
});
