import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { EnrichedTextInput } from 'react-native-enriched';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X,
  Smile,
  Sun,
  MapPin,
  Play,
} from 'lucide-react-native';
import { EditorToolbar } from '@/components/EditorToolbar';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';

interface ChecklistItemType {
  id: string;
  text: string;
  isCompleted: boolean;
}

export default function EntryEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { getEntryById, updateEntry, getEntryMedia, getChecklistItems } = useDatabase();
  const editorRef = useRef<any>(null);
  const [editorState, setEditorState] = useState<any>({});
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideListener = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showListener, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideListener, () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItemType[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [fullScreenMedia, setFullScreenMedia] = useState<{ uri: string; type: string } | null>(null);

  const thumbnailVideoPlayer = useVideoPlayer(media.length > 0 && media[0].type === 'video' ? media[0].uri : '', (player) => { player.pause(); player.muted = true; });
  const fullScreenVideoPlayer = useVideoPlayer(fullScreenMedia?.type === 'video' ? fullScreenMedia.uri : '', (player) => { if (fullScreenMedia?.type === 'video') { player.play(); player.loop = true; } });

  useEffect(() => { if (id && id !== 'new') loadEntry(); }, [id]);

  const loadEntry = async () => {
    const entry = await getEntryById(id!);
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content || '');
      setInitialContent(entry.content || '');
      setMood(entry.mood);
      setWeather(entry.weather);
      setLocation(entry.location);
      setMedia(await getEntryMedia(id!));
      const items = await getChecklistItems(id!);
      setChecklist(items.map(item => ({ id: item.id, text: item.text, isCompleted: item.isCompleted || false })));
    }
  };

  const handleSave = async () => {
    if (id && id !== 'new') {
      await updateEntry(id, { title, content, mood, weather, location });
    }
    router.back();
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([...checklist, { id: Date.now().toString(), text: newChecklistItem.trim(), isCompleted: false }]);
      setNewChecklistItem('');
    }
  };

  const behavior = Platform.OS === 'ios' ? 'padding' : 'height';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={behavior}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}><X size={24} color={theme.text} /></Pressable>
          <View style={styles.headerCenter}><Text style={styles.dateText}>Edit Entry</Text></View>
          <Pressable style={styles.saveButton} onPress={handleSave}><Text style={styles.saveText}>Save</Text></Pressable>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} showsVerticalScrollIndicator persistentScrollbar>
          <TextInput style={styles.titleInput} placeholder="Title your day..." placeholderTextColor={theme.textTertiary} value={title} onChangeText={setTitle} multiline />
          <View style={styles.tagsRow}>
            {mood && <View style={styles.tag}><Smile size={14} color={theme.text} /><Text style={styles.tagText}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text></View>}
            {weather && <View style={[styles.tag, styles.tagOutlined]}><Sun size={14} color={theme.textSecondary} /><Text style={styles.tagTextOutlined}>{weather.charAt(0).toUpperCase() + weather.slice(1)}</Text></View>}
            {location && <View style={[styles.tag, styles.tagOutlined]}><MapPin size={14} color={theme.textSecondary} /><Text style={styles.tagTextOutlined}>{location}</Text></View>}
          </View>
          <EnrichedTextInput ref={editorRef} key={id} style={StyleSheet.flatten([styles.contentInput, { minHeight: 400 }])} placeholder="What's on your mind?..." defaultValue={initialContent} onChangeHtml={(e: any) => setContent(e.nativeEvent.value || '')} onChangeState={(e: any) => setEditorState(e.nativeEvent)} scrollEnabled={false} />
          {media.length > 0 && media[0].uri && (
            <Pressable style={styles.mediaContainer} onPress={() => setFullScreenMedia({ uri: media[0].uri, type: media[0].type || 'image' })}>
              {media[0].type === 'video' ? <View style={styles.videoThumbnailContainer}><VideoView player={thumbnailVideoPlayer} style={styles.mediaImage} contentFit="cover" nativeControls={false} /><View style={styles.playIconOverlay}><Play size={32} color={theme.white} fill={theme.white} /></View></View> : <Image source={{ uri: media[0].uri }} style={styles.mediaImage} />}
            </Pressable>
          )}
          {checklist.length > 0 && <View style={styles.checklistSection}><Text style={styles.sectionLabel}>TO DO</Text>{checklist.map(item => (<Pressable key={item.id} style={styles.checklistItem} onPress={() => setChecklist(checklist.map(i => i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i))}><View style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}>{item.isCompleted && <View style={styles.checkmark} />}</View><Text style={[styles.checklistText, item.isCompleted && styles.checklistTextCompleted]}>{item.text}</Text></Pressable>))}</View>}
          <TextInput style={styles.addMoreInput} placeholder="What else?..." placeholderTextColor={Colors.textTertiary} value={newChecklistItem} onChangeText={setNewChecklistItem} onSubmitEditing={addChecklistItem} />
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={{
          backgroundColor: theme.white,
          borderTopWidth: 1,
          borderTopColor: theme.borderLight,
          paddingBottom: isKeyboardVisible ? (Platform.OS === 'android' ? 12 : 10) : Math.max(insets.bottom, 15),
        }}>
          <EditorToolbar editorRef={editorRef} editorState={editorState} theme={theme} />
        </View>

        <Modal visible={!!fullScreenMedia} transparent animationType="fade" onRequestClose={() => setFullScreenMedia(null)}>
          <View style={styles.fullScreenContainer}><Pressable style={styles.fullScreenCloseButton} onPress={() => setFullScreenMedia(null)}><X size={30} color={theme.white} /></Pressable><View style={styles.fullScreenContent}>{fullScreenMedia?.type === 'video' ? <VideoView player={fullScreenVideoPlayer} style={styles.fullScreenVideo} contentFit="contain" nativeControls /> : <Image source={{ uri: fullScreenMedia?.uri }} style={styles.fullScreenImage} resizeMode="contain" />}</View></View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  closeButton: { padding: Spacing.xs },
  headerCenter: { alignItems: 'center' },
  dateText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
  timeText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  saveButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  saveText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.white },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  titleInput: { fontSize: 28, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md, paddingVertical: Spacing.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceSecondary },
  tagOutlined: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontSize: FontSizes.sm, color: Colors.text, fontWeight: FontWeights.medium },
  tagTextOutlined: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  contentInput: { fontSize: FontSizes.md, color: Colors.text, lineHeight: 26, marginBottom: Spacing.lg },
  mediaContainer: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.lg, backgroundColor: Colors.surfaceSecondary },
  mediaImage: { width: '100%', height: 220 },
  checklistSection: { marginBottom: Spacing.md },
  sectionLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.md },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md },
  checkbox: { width: 24, height: 24, borderRadius: BorderRadius.sm, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { width: 12, height: 6, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: Colors.white, transform: [{ rotate: '-45deg' }, { translateY: -2 }] },
  checklistText: { fontSize: FontSizes.md, color: Colors.text },
  checklistTextCompleted: { textDecorationLine: 'line-through', color: Colors.textTertiary },
  addMoreInput: { fontSize: FontSizes.md, color: Colors.textTertiary, paddingVertical: Spacing.md },
  videoThumbnailContainer: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center' },
  playIconOverlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 30 },
  fullScreenContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullScreenCloseButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  fullScreenContent: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '100%' },
  fullScreenVideo: { width: '100%', height: '100%' },
});
