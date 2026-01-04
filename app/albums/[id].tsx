import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Play, Image as ImageIcon, Video } from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';

interface MediaItem {
  id: string;
  uri: string;
  type: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  createdAt: string;
}

export default function AlbumDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { albums, getAllMedia } = useDatabase();
  const [album, setAlbum] = useState<any>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlbumData();
  }, [id]);

  const loadAlbumData = async () => {
    try {
      const foundAlbum = albums.find((a) => a.id === id);
      setAlbum(foundAlbum);

      const allMedia = await getAllMedia();
      setMediaItems(allMedia as MediaItem[]);
    } catch (error) {
      console.warn('Error loading album:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMediaGrid = () => {
    if (mediaItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ImageIcon size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Media Yet</Text>
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            Media from your journal entries will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.mediaGrid}>
        {mediaItems.map((item) => (
          <Pressable key={item.id} style={styles.mediaItem}>
            <Image source={{ uri: item.uri }} style={styles.mediaImage} />
            {item.type === 'video' && (
              <View style={styles.videoOverlay}>
                <View style={styles.playButton}>
                  <Play size={20} color={theme.white} fill={theme.white} />
                </View>
                {item.duration && (
                  <View style={styles.durationBadge}>
                    <Text style={[styles.durationText, { color: theme.white }]}>
                      {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!album) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Album Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: theme.text }]}>Album Not Found</Text>
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>This album could not be loaded</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageCount = mediaItems.filter((m) => m.type === 'image').length;
  const videoCount = mediaItems.filter((m) => m.type === 'video').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{album.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.albumInfo, { backgroundColor: theme.surface }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ImageIcon size={20} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{imageCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Photos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Video size={20} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{videoCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Videos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>{mediaItems.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderMediaGrid()}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  albumInfo: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  statLabel: {
    fontSize: FontSizes.sm,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  mediaItem: {
    width: '32.5%',
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  durationText: {
    fontSize: 10,
    fontWeight: FontWeights.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
});
