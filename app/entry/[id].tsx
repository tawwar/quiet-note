import React, { useState, useEffect } from 'react';
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
  TouchableWithoutFeedback,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Type,
  CheckSquare,
  Image as ImageIcon,
  Grid3X3,
  Mic,
  MapPin,
  Sun,
  Smile,
  Plus,
  Trash2,
  Play,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import MoodIcon from '@/components/MoodIcon';

interface ChecklistItemType {
  id: string;
  text: string;
  isCompleted: boolean;
}

const sampleEntry = {
  id: '1',
  title: 'Finding peace in chaos',
  content: "Today started with a rush, but I managed to carve out some time for myself. The city feels different when you actually stop to look at it instead of just rushing through.",
  mood: 'happy',
  weather: 'sunny',
  location: 'Central Park',
  createdAt: '2023-10-24T10:42:00',
  image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800',
  imageCaption: 'Morning Coffee',
  imageTime: '9:30 AM',
  checklist: [
    { id: '1', text: 'Grocery run for dinner', isCompleted: false },
    { id: '2', text: 'Call Mom', isCompleted: true },
  ],
};

export default function EntryEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntryById, updateEntry, getEntryMedia, getChecklistItems } = useDatabase();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItemType[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [fullScreenMedia, setFullScreenMedia] = useState<{ uri: string; type: string } | null>(null);

  const isNewEntry = id === 'new';

  useEffect(() => {
    if (!isNewEntry && id) {
      loadEntry();
    } else {
      setTitle(sampleEntry.title);
      setContent(sampleEntry.content);
      setMood(sampleEntry.mood);
      setWeather(sampleEntry.weather);
      setLocation(sampleEntry.location);
      setChecklist(sampleEntry.checklist);
      setMedia([{
        id: '1',
        uri: sampleEntry.image,
        caption: sampleEntry.imageCaption,
        time: sampleEntry.imageTime,
      }]);
    }
  }, [id]);

  const loadEntry = async () => {
    if (id && id !== 'new') {
      const entry = await getEntryById(id);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content || '');
        setMood(entry.mood);
        setWeather(entry.weather);
        setLocation(entry.location);

        const entryMedia = await getEntryMedia(id);
        setMedia(entryMedia);

        const items = await getChecklistItems(id);
        setChecklist(items.map((item) => ({
          id: item.id,
          text: item.text,
          isCompleted: item.isCompleted || false,
        })));
      }
    }
  };

  const now = new Date(sampleEntry.createdAt);
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleSave = async () => {
    if (id && id !== 'new') {
      await updateEntry(id, {
        title,
        content,
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

        <TextInput
          style={styles.contentInput}
          placeholder="What's on your mind today? Start writing..."
          placeholderTextColor={Colors.textTertiary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {media.length > 0 && media[0].uri && (
          <Pressable
            style={styles.mediaContainer}
            onPress={() => setFullScreenMedia({ uri: media[0].uri, type: media[0].type || 'image' })}
          >
            {media[0].type === 'video' ? (
              <View style={styles.videoThumbnailContainer}>
                <Video
                  source={{ uri: media[0].uri }}
                  style={styles.mediaImage}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isMuted={true}
                />
                <View style={styles.playIconOverlay}>
                  <Play size={32} color={Colors.white} fill={Colors.white} />
                </View>
              </View>
            ) : (
              <Image source={{ uri: media[0].uri }} style={styles.mediaImage} />
            )}

            {(media[0].caption || media[0].time) && (
              <View style={styles.mediaCaptionContainer}>
                <Text style={styles.mediaCaption}>
                  {media[0].caption} {media[0].time && `• ${media[0].time}`}
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

      <View style={styles.toolbar}>
        <Pressable style={styles.toolButton}>
          <Type size={22} color={Colors.text} />
        </Pressable>
        <Pressable style={[styles.toolButton, styles.toolButtonActive]}>
          <CheckSquare size={22} color={Colors.primary} />
        </Pressable>
        <Pressable style={styles.toolButton}>
          <ImageIcon size={22} color={Colors.text} />
        </Pressable>
        <Pressable style={styles.toolButton}>
          <Grid3X3 size={22} color={Colors.text} />
        </Pressable>
        <Pressable style={styles.toolButton}>
          <Mic size={22} color={Colors.text} />
        </Pressable>
      </View>

      <Modal
        visible={!!fullScreenMedia}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenMedia(null)}
      >
        <View style={styles.fullScreenContainer}>
          <Pressable style={styles.fullScreenCloseButton} onPress={() => setFullScreenMedia(null)}>
            <X size={30} color={Colors.white} />
          </Pressable>
          <View style={styles.fullScreenContent}>
            {fullScreenMedia?.type === 'video' ? (
              <Video
                source={{ uri: fullScreenMedia.uri }}
                style={styles.fullScreenVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping
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
    </SafeAreaView >
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
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 26,
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  toolButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  toolButtonActive: {
    backgroundColor: Colors.surfaceSecondary,
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
