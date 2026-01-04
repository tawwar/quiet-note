import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  InputAccessoryView,
  Keyboard,
  Alert,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X,
  Image as ImageIcon,
  Mic,
  MapPin,
  Sun,
  Smile,
  Play,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import RichTextEditor, { RichTextEditorRef } from '@/components/RichTextEditor';
import FormattingToolbar from '@/components/FormattingToolbar';
import type { OnChangeStateEvent } from 'react-native-enriched';

interface ChecklistItemType {
  id: string;
  text: string;
  isCompleted: boolean;
}

const INPUT_ACCESSORY_VIEW_ID = 'editRichTextToolbar';

export default function EntryEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntryById, updateEntry, getEntryMedia, getChecklistItems } = useDatabase();
  const editorRef = useRef<RichTextEditorRef>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItemType[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [fullScreenMedia, setFullScreenMedia] = useState<{ uri: string; type: string } | null>(null);
  const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(null);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const isNewEntry = id === 'new';

  // Track keyboard visibility
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

  // Video player for thumbnail
  const thumbnailPlayer = useVideoPlayer(
    media.length > 0 && media[0].type === 'video' ? media[0].uri : null,
    (player) => {
      player.loop = false;
      player.muted = true;
    }
  );

  // Video player for fullscreen
  const fullscreenPlayer = useVideoPlayer(
    fullScreenMedia?.type === 'video' ? fullScreenMedia.uri : null,
    (player) => {
      player.loop = true;
      player.play();
    }
  );

  useEffect(() => {
    if (!isNewEntry && id) {
      loadEntry();
    }
  }, [id]);

  useEffect(() => {
    if (isLoaded && content && editorRef.current) {
      editorRef.current.setHtml(content);
    }
  }, [isLoaded, content]);

  const loadEntry = async () => {
    if (id && id !== 'new') {
      const entry = await getEntryById(id);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content || '');
        setMood(entry.mood);
        setWeather(entry.weather);
        setLocation(entry.location);
        setCreatedAt(entry.createdAt);

        const entryMedia = await getEntryMedia(id);
        setMedia(entryMedia);

        const items = await getChecklistItems(id);
        setChecklist(items.map((item) => ({
          id: item.id,
          text: item.text,
          isCompleted: item.isCompleted || false,
        })));
        
        setIsLoaded(true);
      }
    }
  };

  const displayDate = createdAt ? new Date(createdAt) : new Date();
  const dateStr = displayDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = displayDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please add a title for your entry before saving.');
      return;
    }
    
    const html = await editorRef.current?.getHtml();
    
    if (id && id !== 'new') {
      await updateEntry(id, {
        title: title.trim(),
        content: html || null,
        mood,
        weather,
        location,
      });
    }
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(checklist.map((item) =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([
        ...checklist,
        {
          id: Date.now().toString(),
          text: newChecklistItem.trim(),
          isCompleted: false,
        },
      ]);
      setNewChecklistItem('');
    }
  };

  const openFullScreen = (uri: string, type: string) => {
    setFullScreenMedia({ uri, type });
  };

  const closeFullScreen = () => {
    if (fullscreenPlayer) {
      fullscreenPlayer.pause();
    }
    setFullScreenMedia(null);
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
    <>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title your day..."
          placeholderTextColor={Colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          multiline
        />

        <View style={styles.tagsRow}>
          {mood && (
            <View style={styles.tag}>
              <Smile size={14} color={Colors.text} />
              <Text style={styles.tagText}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
            </View>
          )}
          {weather && (
            <View style={[styles.tag, styles.tagOutlined]}>
              <Sun size={14} color={Colors.textSecondary} />
              <Text style={styles.tagTextOutlined}>
                {weather.charAt(0).toUpperCase() + weather.slice(1)}
              </Text>
            </View>
          )}
          {location && (
            <View style={[styles.tag, styles.tagOutlined]}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.tagTextOutlined}>{location}</Text>
            </View>
          )}
        </View>

        <RichTextEditor
          ref={editorRef}
          placeholder="What's on your mind today? Start writing..."
          onChangeState={setStylesState}
          onFocus={() => setIsContentFocused(true)}
          onBlur={() => setIsContentFocused(false)}
          style={styles.contentInput}
        />

        {media.length > 0 && media[0].uri && (
          <Pressable
            style={styles.mediaContainer}
            onPress={() => openFullScreen(media[0].uri, media[0].type || 'image')}
          >
            {media[0].type === 'video' ? (
              <View style={styles.videoThumbnailContainer}>
                <VideoView
                  player={thumbnailPlayer}
                  style={styles.mediaImage}
                  nativeControls={false}
                  contentFit="cover"
                />
                <View style={styles.playIconOverlay}>
                  <Play size={32} color={Colors.white} fill={Colors.white} />
                </View>
              </View>
            ) : (
              <Image source={{ uri: media[0].uri }} style={styles.mediaImage} />
            )}

            {(media[0].caption || media[0].timestamp) && (
              <View style={styles.mediaCaptionContainer}>
                <Text style={styles.mediaCaption}>
                  {media[0].caption} {media[0].timestamp && `• ${media[0].timestamp}`}
                </Text>
              </View>
            )}
          </Pressable>
        )}

        {checklist.length > 0 && (
          <View style={styles.checklistSection}>
            <Text style={styles.sectionLabel}>TO DO</Text>
            {checklist.map((item) => (
              <Pressable
                key={item.id}
                style={styles.checklistItem}
                onPress={() => toggleChecklistItem(item.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.isCompleted && styles.checkboxChecked,
                  ]}
                >
                  {item.isCompleted && (
                    <View style={styles.checkmark} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistText,
                    item.isCompleted && styles.checklistTextCompleted,
                  ]}
                >
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <TextInput
          style={styles.addMoreInput}
          placeholder="What else is on your mind?"
          placeholderTextColor={Colors.textTertiary}
          value={newChecklistItem}
          onChangeText={setNewChecklistItem}
          onSubmitEditing={addChecklistItem}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* <View style={styles.bottomToolbar}>
        <Pressable style={styles.toolButton}>
          <ImageIcon size={22} color={Colors.text} />
        </Pressable>
        <Pressable style={styles.toolButton}>
          <Mic size={22} color={Colors.text} />
        </Pressable>
      </View> */}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {Platform.OS === 'ios' ? (
        <>
          {renderContent()}
          <InputAccessoryView nativeID={INPUT_ACCESSORY_VIEW_ID}>
            {showToolbar && renderToolbar()}
          </InputAccessoryView>
        </>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {renderContent()}
          {showToolbar && renderToolbar()}
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={!!fullScreenMedia}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreen}
      >
        <View style={styles.fullScreenContainer}>
          <Pressable style={styles.fullScreenCloseButton} onPress={closeFullScreen}>
            <X size={30} color={Colors.white} />
          </Pressable>
          <View style={styles.fullScreenContent}>
            {fullScreenMedia?.type === 'video' ? (
              <VideoView
                player={fullscreenPlayer}
                style={styles.fullScreenVideo}
                nativeControls
                contentFit="contain"
              />
            ) : (
              <Image
                source={{ uri: fullScreenMedia?.uri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
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
  closeButton: {
    padding: Spacing.xs,
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  tagOutlined: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: FontWeights.medium,
  },
  tagTextOutlined: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  contentInput: {
    marginBottom: Spacing.lg,
  },
  mediaContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceSecondary,
  },
  mediaImage: {
    width: '100%',
    height: 220,
  },
  mediaCaptionContainer: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  mediaCaption: {
    fontSize: FontSizes.sm,
    color: Colors.white,
  },
  checklistSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.white,
    transform: [{ rotate: '-45deg' }, { translateY: -2 }],
  },
  checklistText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  addMoreInput: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
    paddingVertical: Spacing.md,
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
    gap: Spacing.md,
  },
  toolButton: {
    padding: Spacing.sm,
  },
  videoThumbnailContainer: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 30,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
});
