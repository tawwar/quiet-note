import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search,
  Heart,
  Video,
  Calendar,
  ChevronRight,
  Plus,
  Play,
  Image as ImageIcon,
  ChevronDown,
  Home,
  User,
} from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';

const filterChips = [
  { id: 'favorites', label: 'Favorites', icon: Heart, active: true },
  { id: 'videos', label: 'Videos', icon: Video, active: false },
  { id: 'lastMonth', label: 'Last Month', icon: Calendar, active: false },
];

interface DisplayAlbum {
  id: string;
  name: string;
  photoCount?: number;
  videoCount?: number;
  isPinned?: boolean;
  coverImage: string;
  date?: string;
  isNew?: boolean;
  isVideo?: boolean;
  emoji?: string;
}

const sampleAlbums: DisplayAlbum[] = [
  {
    id: '1',
    name: 'Nature Escapes',
    photoCount: 142,
    isPinned: true,
    coverImage: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '2',
    name: 'Birthday Bash',
    photoCount: 42,
    date: 'Aug 24',
    isNew: true,
    coverImage: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function AlbumsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { userSettings, albums } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('favorites');

  const displayAlbums: DisplayAlbum[] = albums.length > 0
    ? albums.map((a) => ({
        id: a.id,
        name: a.name,
        isPinned: a.isPinned || false,
        coverImage: a.coverImageUri || 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
      }))
    : sampleAlbums;
  const pinnedAlbum = displayAlbums.find((a) => a.isPinned);
  const regularAlbums = displayAlbums.filter((a) => !a.isPinned);

  const handleAlbumPress = (albumId: string) => {
    router.push(`/albums/${albumId}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={[styles.avatar, { backgroundColor: theme.surfaceSecondary, borderColor: theme.surface }]}>
              <Text style={[styles.avatarText, { color: theme.text }]}>
                {userSettings?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Pressable style={[styles.addButton, { borderColor: theme.primary, backgroundColor: theme.surface }]}>
              <Plus size={20} color={theme.primary} />
            </Pressable>
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]}>My Albums</Text>
            <Text style={[styles.collectionCount, { color: theme.textSecondary }]}>12 Collections</Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search memories, dates, or tags..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            const IconComponent = chip.icon;
            return (
              <Pressable
                key={chip.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setActiveFilter(chip.id)}
              >
                <IconComponent
                  size={16}
                  color={isActive ? theme.white : theme.textSecondary}
                />
                <Text style={[
                  styles.filterText,
                  { color: theme.textSecondary },
                  isActive && { color: theme.white },
                ]}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {pinnedAlbum && (
          <Pressable
            style={styles.pinnedAlbum}
            onPress={() => handleAlbumPress(pinnedAlbum.id)}
          >
            <Image
              source={{ uri: pinnedAlbum.coverImage }}
              style={styles.pinnedImage}
            />
            <View style={styles.pinnedOverlay}>
              <View style={styles.pinnedContent}>
                <Text style={styles.pinnedLabel}>PINNED ALBUM</Text>
                <Text style={[styles.pinnedName, { color: theme.white }]}>{pinnedAlbum.name}</Text>
                <View style={styles.pinnedMeta}>
                  <ImageIcon size={14} color={theme.white} />
                  <Text style={[styles.pinnedCount, { color: theme.white }]}>
                    {pinnedAlbum.photoCount || 0} Photos
                  </Text>
                </View>
              </View>
              <Pressable style={styles.pinnedArrow}>
                <ChevronRight size={24} color={theme.white} />
              </Pressable>
            </View>
          </Pressable>
        )}

        <View style={styles.albumsGrid}>
          {regularAlbums.map((album) => (
            <Pressable
              key={album.id}
              style={styles.albumCard}
              onPress={() => handleAlbumPress(album.id)}
            >
              <View style={styles.albumImageContainer}>
                <Image
                  source={{ uri: album.coverImage }}
                  style={styles.albumImage}
                />
                {album.isNew && (
                  <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.newBadgeText, { color: theme.white }]}>NEW</Text>
                  </View>
                )}
                {album.isVideo && (
                  <View style={styles.playBadge}>
                    <Play size={16} color={theme.white} fill={theme.white} />
                  </View>
                )}
              </View>
              <Text style={[styles.albumName, { color: theme.text }]}>
                {album.name}
              </Text>
              <Text style={[styles.albumMeta, { color: theme.textSecondary }]}>
                {album.date || ''}{album.photoCount
                  ? `${album.date ? ' • ' : ''}${album.photoCount} Photos`
                  : ''}
                {album.videoCount
                  ? `${album.date ? ' • ' : ''}${album.videoCount} Videos`
                  : ''}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.viewAllButton}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>View All Collections</Text>
          <ChevronDown size={18} color={theme.primary} />
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.borderLight }]}>
        <Pressable style={styles.tabItem} onPress={() => router.push('/(tabs)')}>
          <Home size={24} color={theme.textTertiary} />
          <Text style={[styles.tabLabel, { color: theme.textTertiary }]}>Home</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push('/(tabs)/calendar')}>
          <Calendar size={24} color={theme.textTertiary} />
          <Text style={[styles.tabLabel, { color: theme.textTertiary }]}>Calendar</Text>
        </Pressable>
        <Pressable style={[styles.tabItem, styles.tabItemActive]}>
          <ImageIcon size={24} color={theme.primary} />
          <Text style={[styles.tabLabel, { color: theme.primary }]}>Albums</Text>
          <View style={[styles.tabDot, { backgroundColor: theme.primary }]} />
        </Pressable>
        <Pressable style={styles.tabItem}>
          <User size={24} color={theme.textTertiary} />
          <Text style={[styles.tabLabel, { color: theme.textTertiary }]}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Shadows.sm,
  },
  avatarText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeights.bold,
  },
  collectionCount: {
    fontSize: FontSizes.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  pinnedAlbum: {
    marginHorizontal: Spacing.lg,
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  pinnedImage: {
    width: '100%',
    height: '100%',
  },
  pinnedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  pinnedContent: {
    flex: 1,
  },
  pinnedLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  pinnedName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  pinnedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinnedCount: {
    fontSize: FontSizes.sm,
  },
  pinnedArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  albumCard: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  albumImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
  },
  playBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: 2,
  },
  albumMeta: {
    fontSize: FontSizes.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.lg,
  },
  viewAllText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    paddingBottom: 28,
    paddingHorizontal: Spacing.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabItemActive: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: FontWeights.medium,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
