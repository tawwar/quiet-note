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
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';

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
  {
    id: '3',
    name: 'Food Diary',
    photoCount: 18,
    date: 'Updated Yesterday',
    coverImage: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '4',
    name: 'Archie',
    photoCount: 365,
    date: 'Ongoing',
    emoji: 'dog',
    coverImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '5',
    name: 'Concert Clips',
    videoCount: 12,
    date: 'Last Week',
    isVideo: true,
    coverImage: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function AlbumsScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userSettings?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Pressable style={styles.addButton}>
              <Plus size={20} color={Colors.primary} />
            </Pressable>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>My Albums</Text>
            <Text style={styles.collectionCount}>12 Collections</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search memories, dates, or tags..."
            placeholderTextColor={Colors.textTertiary}
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
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(chip.id)}
              >
                <IconComponent
                  size={16}
                  color={isActive ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
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
                <Text style={styles.pinnedName}>{pinnedAlbum.name}</Text>
                <View style={styles.pinnedMeta}>
                  <ImageIcon size={14} color={Colors.white} />
                  <Text style={styles.pinnedCount}>
                    {pinnedAlbum.photoCount || 0} Photos
                  </Text>
                </View>
              </View>
              <Pressable style={styles.pinnedArrow}>
                <ChevronRight size={24} color={Colors.white} />
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
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                {album.isVideo && (
                  <View style={styles.playBadge}>
                    <Play size={16} color={Colors.white} fill={Colors.white} />
                  </View>
                )}
              </View>
              <Text style={styles.albumName}>
                {album.name} {album.emoji === 'dog' ? ' ' : ''}
              </Text>
              <Text style={styles.albumMeta}>
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
          <Text style={styles.viewAllText}>View All Collections</Text>
          <ChevronDown size={18} color={Colors.primary} />
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.tabBar}>
        <Pressable style={styles.tabItem} onPress={() => router.push('/(tabs)')}>
          <Home size={24} color={Colors.textTertiary} />
          <Text style={styles.tabLabel}>Home</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push('/(tabs)/calendar')}>
          <Calendar size={24} color={Colors.textTertiary} />
          <Text style={styles.tabLabel}>Calendar</Text>
        </Pressable>
        <Pressable style={[styles.tabItem, styles.tabItemActive]}>
          <ImageIcon size={24} color={Colors.primary} />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Albums</Text>
          <View style={styles.tabDot} />
        </Pressable>
        <Pressable style={styles.tabItem}>
          <User size={24} color={Colors.textTertiary} />
          <Text style={styles.tabLabel}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.sm,
  },
  avatarText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  collectionCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  filterTextActive: {
    color: Colors.white,
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
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  pinnedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinnedCount: {
    fontSize: FontSizes.sm,
    color: Colors.white,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.white,
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
    color: Colors.text,
    marginBottom: 2,
  },
  albumMeta: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
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
    color: Colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
});
