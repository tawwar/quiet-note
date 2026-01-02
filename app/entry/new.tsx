import React, { useState, useRef, useMemo } from 'react';
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
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Hash,
  Smile,
  Camera,
  Image as ImageIcon,
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
import { EnrichedTextInput } from 'react-native-enriched';
import FAB from '@/components/FAB';
import { EditorToolbar } from '@/components/EditorToolbar';

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
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { createEntry, addMedia } = useDatabase();
  const editorRef = useRef<any>(null);
  const [editorState, setEditorState] = useState<any>({});
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const initialContent = useRef('');
  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const showListener = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideListener = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showListener, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideListener, () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const selectedMood = moods.find((m) => m.id === mood);

  const handleSave = async () => {
    const safeTitle = title || '';
    const safeContent = content || '';
    if (!safeTitle.trim() && !safeContent.trim() && mediaItems.length === 0) return;

    const entryId = await createEntry({
      title: safeTitle.trim() || 'Untitled Entry',
      content: safeContent.trim(),
      mood,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
    });

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      await addMedia({
        entryId,
        type: item.type,
        uri: item.uri,
        width: item.width,
        height: item.height,
        duration: item.duration,
        order: i,
      });
    }
    router.back();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCamera = async () => {
    setShowFabMenu(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setMediaItems((prev) => [...prev, { uri: asset.uri, type: asset.type === 'video' ? 'video' : 'image', width: asset.width, height: asset.height, duration: asset.duration || undefined }]);
    }
  };

  const handleGallery = async () => {
    setShowFabMenu(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) {
      const newItems = result.assets.map((asset) => ({ uri: asset.uri, type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video', width: asset.width, height: asset.height, duration: asset.duration || undefined }));
      setMediaItems((prev) => [...prev, ...newItems]);
    }
  };

  // We use height behavior on Android to ensure compatibility with Samsung/Google bars
  const behavior = Platform.OS === 'ios' ? 'padding' : 'height';
  // keyboardVerticalOffset is key for Android if resize mode is cut-off
  const verticalOffset = Platform.OS === 'android' ? 0 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={behavior}
        keyboardVerticalOffset={verticalOffset}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
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
            <Hash size={16} color={theme.textSecondary} />
            <Text style={styles.tagButtonText}>ADD TAG</Text>
          </Pressable>
          <Pressable style={[styles.tagButton, mood && styles.tagButtonActive]} onPress={() => setShowMoodPicker(true)}>
            {selectedMood ? <selectedMood.icon size={16} color={selectedMood.color} /> : <Smile size={16} color={theme.textSecondary} />}
            <Text style={[styles.tagButtonText, mood && styles.tagButtonTextActive]}>{selectedMood ? selectedMood.label.toUpperCase() : 'ADD EMOTION'}</Text>
          </Pressable>
        </View>

        {tags.length > 0 && (
          <View style={styles.selectedTags}>
            {tags.map((tag) => (
              <Pressable key={tag} style={styles.selectedTag} onPress={() => setTags(tags.filter(t => t !== tag))}>
                <Text style={styles.selectedTagText}>#{tag}</Text>
                <X size={14} color={theme.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="Title your day..."
            placeholderTextColor={theme.textTertiary}
            value={title}
            onChangeText={setTitle}
            multiline
          />
          <EnrichedTextInput
            ref={editorRef}
            style={StyleSheet.flatten([styles.contentInput, { minHeight: 400 }])}
            placeholder="What's on your mind today? Start writing..."
            defaultValue={initialContent.current}
            onChangeHtml={(e: any) => setContent(e.nativeEvent.value || '')}
            onChangeState={(e: any) => setEditorState(e.nativeEvent)}
            scrollEnabled={false}
          />
          {mediaItems.length > 0 && (
            <View style={styles.mediaGrid}>
              {mediaItems.map((item, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                  {item.type === 'video' && <View style={styles.videoOverlay}><Play size={24} color={theme.white} fill={theme.white} /></View>}
                  <Pressable style={styles.removeMediaButton} onPress={() => handleRemoveMedia(index)}><X size={16} color={theme.white} /></Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={{
          backgroundColor: theme.white,
          borderTopWidth: 1,
          borderTopColor: theme.borderLight,
          paddingBottom: isKeyboardVisible ? (Platform.OS === 'android' ? 12 : 10) : Math.max(insets.bottom, 15),
        }}>
          <EditorToolbar editorRef={editorRef} editorState={editorState} theme={theme} />
        </View>

        <FAB onPress={() => setShowFabMenu(true)} style={[styles.fab, { bottom: 90 }]} />

        <Modal visible={showFabMenu} transparent animationType="fade" onRequestClose={() => setShowFabMenu(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowFabMenu(false)}>
            <Pressable style={styles.fabMenu} onPress={(e) => e.stopPropagation()}>
              <Pressable style={styles.fabMenuItem} onPress={handleCamera}>
                <View style={styles.fabMenuIcon}><Camera size={24} color={theme.primary} /></View>
                <Text style={styles.fabMenuText}>Take Photo/Video</Text>
              </Pressable>
              <Pressable style={styles.fabMenuItem} onPress={handleGallery}>
                <View style={styles.fabMenuIcon}><ImageIcon size={24} color={theme.primary} /></View>
                <Text style={styles.fabMenuText}>Choose from Gallery</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={showMoodPicker} transparent animationType="slide" onRequestClose={() => setShowMoodPicker(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowMoodPicker(false)}>
            <Pressable style={styles.moodPicker} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.moodPickerTitle}>How are you feeling?</Text>
              <View style={styles.moodGrid}>
                {moods.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mood === m.id;
                  return (
                    <Pressable key={m.id} style={[styles.moodItem, isSelected && styles.moodItemSelected]} onPress={() => { setMood(m.id); setShowMoodPicker(false); }}>
                      <Icon size={28} color={isSelected ? m.color : theme.textSecondary} />
                      <Text style={[styles.moodLabel, isSelected && { color: m.color, fontWeight: FontWeights.medium }]}>{m.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={showTagInput} transparent animationType="fade" onRequestClose={() => setShowTagInput(false)}>
          <Pressable style={styles.tagModalOverlay} onPress={() => setShowTagInput(false)}>
            <Pressable style={styles.tagInputModal} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.tagInputTitle}>Add a tag</Text>
              <TextInput style={styles.tagTextInput} placeholder="Enter tag name" value={newTag} onChangeText={setNewTag} autoFocus onSubmitEditing={handleAddTag} />
              <View style={styles.tagInputButtons}>
                <Pressable onPress={() => { setNewTag(''); setShowTagInput(false); }}><Text style={styles.tagInputCancelText}>Cancel</Text></Pressable>
                <Pressable style={styles.tagInputAdd} onPress={handleAddTag}><Text style={styles.tagInputAddText}>Add</Text></Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  cancelText: { fontSize: FontSizes.md, color: theme.text },
  headerCenter: { alignItems: 'center' },
  dateText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: theme.text },
  timeText: { fontSize: FontSizes.sm, color: theme.textSecondary },
  saveButton: { backgroundColor: theme.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  saveText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: theme.white },
  tagsRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm },
  tagButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' },
  tagButtonActive: { borderColor: theme.primary, borderStyle: 'solid', backgroundColor: '#E0F7F5' },
  tagButtonText: { fontSize: FontSizes.sm, color: theme.textSecondary, fontWeight: FontWeights.medium },
  tagButtonTextActive: { color: theme.primary },
  selectedTags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.xs },
  selectedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.surfaceSecondary, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  selectedTagText: { fontSize: FontSizes.sm, color: theme.text },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  titleInput: { fontSize: 28, fontWeight: FontWeights.bold, color: theme.text, marginBottom: Spacing.md, paddingVertical: Spacing.sm },
  contentInput: { fontSize: FontSizes.md, color: theme.textSecondary, lineHeight: 24 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
  mediaItem: { width: '48%', aspectRatio: 1, borderRadius: BorderRadius.md, overflow: 'hidden', position: 'relative' },
  mediaImage: { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  removeMediaButton: { position: 'absolute', top: Spacing.xs, right: Spacing.xs, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  tagModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  fabMenu: { backgroundColor: theme.white, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg },
  fabMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  fabMenuIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  fabMenuText: { fontSize: FontSizes.md, color: theme.text, fontWeight: FontWeights.medium },
  moodPicker: { backgroundColor: theme.white, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg },
  moodPickerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: theme.text, textAlign: 'center', marginBottom: Spacing.lg },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  moodItem: { alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: theme.surfaceSecondary, width: '30%' },
  moodItemSelected: { backgroundColor: '#E0F7F5', borderWidth: 1, borderColor: theme.primary },
  moodLabel: { fontSize: FontSizes.sm, color: theme.textSecondary, marginTop: Spacing.xs },
  tagInputModal: { backgroundColor: theme.white, marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, padding: Spacing.lg, width: '90%', maxWidth: 400 },
  tagInputTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: theme.text, marginBottom: Spacing.md },
  tagTextInput: { fontSize: FontSizes.md, borderWidth: 1, borderColor: theme.border, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, color: theme.text },
  tagInputButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.lg },
  tagInputCancelText: { fontSize: FontSizes.md, color: theme.textSecondary },
  tagInputAdd: { backgroundColor: theme.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  tagInputAddText: { fontSize: FontSizes.md, color: theme.white, fontWeight: FontWeights.medium },
});
