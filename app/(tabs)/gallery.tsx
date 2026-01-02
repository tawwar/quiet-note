import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Image,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
    Image as ImageIcon,
    Video as VideoIcon,
    Play,
    X,
    Grid3X3,
} from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';
import * as schema from '@/db/schema';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / COLUMN_COUNT;
const PAGE_SIZE = 10;

type FilterType = 'all' | 'image' | 'video';

export default function GalleryScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const { getPagedMedia } = useDatabase();
    const insets = useSafeAreaInsets();

    const [mediaItems, setMediaItems] = useState<schema.EntryMedia[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [page, setPage] = useState(0);
    const [fullScreenMedia, setFullScreenMedia] = useState<{ uri: string; type: string } | null>(null);

    // Video player for full-screen
    const fullScreenVideoPlayer = useVideoPlayer(
        fullScreenMedia?.type === 'video' ? fullScreenMedia.uri : '',
        (player) => {
            if (fullScreenMedia?.type === 'video') {
                player.play();
                player.loop = true;
            }
        }
    );

    const fetchMedia = async (pageNum: number, currentFilter: FilterType, reset: boolean = false) => {
        if (loading || (!hasMore && !reset)) return;

        setLoading(true);
        try {
            const type = currentFilter === 'all' ? undefined : currentFilter;
            const offset = pageNum * PAGE_SIZE;
            const newMedia = await getPagedMedia(PAGE_SIZE, offset, type);

            if (reset) {
                setMediaItems(newMedia);
            } else {
                setMediaItems((prev) => [...prev, ...newMedia]);
            }

            setHasMore(newMedia.length === PAGE_SIZE);
            setPage(pageNum + 1);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load when filter changes
        setPage(0);
        setHasMore(true);
        fetchMedia(0, filter, true);
    }, [filter]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchMedia(page, filter);
        }
    };

    const handleEntryPress = (entryId: string) => {
        router.push(`/entry/${entryId}`);
    };

    const renderItem = ({ item }: { item: schema.EntryMedia }) => (
        <Pressable
            style={styles.mediaItem}
            onPress={() => setFullScreenMedia({ uri: item.uri, type: item.type })}
        >
            <View style={styles.mediaContainer}>
                {item.type === 'video' ? (
                    <View style={styles.videoThumbnailContainer}>
                        <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                        <View style={styles.playIconOverlay}>
                            <Play size={20} color={theme.white} fill={theme.white} />
                        </View>
                    </View>
                ) : (
                    <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                )}
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Gallery</Text>
                <Text style={styles.subtitle}>{mediaItems.length} items</Text>
            </View>

            <View style={styles.filters}>
                <Pressable
                    style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
                    onPress={() => setFilter('all')}
                >
                    <Grid3X3 size={16} color={filter === 'all' ? theme.white : theme.textSecondary} />
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
                </Pressable>
                <Pressable
                    style={[styles.filterChip, filter === 'image' && styles.filterChipActive]}
                    onPress={() => setFilter('image')}
                >
                    <ImageIcon size={16} color={filter === 'image' ? theme.white : theme.textSecondary} />
                    <Text style={[styles.filterText, filter === 'image' && styles.filterTextActive]}>Pictures</Text>
                </Pressable>
                <Pressable
                    style={[styles.filterChip, filter === 'video' && styles.filterChipActive]}
                    onPress={() => setFilter('video')}
                >
                    <VideoIcon size={16} color={filter === 'video' ? theme.white : theme.textSecondary} />
                    <Text style={[styles.filterText, filter === 'video' && styles.filterTextActive]}>Videos</Text>
                </Pressable>
            </View>

            <FlatList
                data={mediaItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <ImageIcon size={48} color={theme.textTertiary} />
                            <Text style={styles.emptyText}>No media found</Text>
                        </View>
                    ) : null
                }
            />

            <Modal
                visible={!!fullScreenMedia}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFullScreenMedia(null)}
            >
                <View style={styles.fullScreenContainer}>
                    <Pressable style={styles.fullScreenCloseButton} onPress={() => setFullScreenMedia(null)}>
                        <X size={30} color={theme.white} />
                    </Pressable>
                    <View style={styles.fullScreenContent}>
                        {fullScreenMedia?.type === 'video' ? (
                            <VideoView
                                player={fullScreenVideoPlayer}
                                style={styles.fullScreenVideo}
                                contentFit="contain"
                                nativeControls={true}
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

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: FontWeights.bold,
        color: theme.text,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        color: theme.textSecondary,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: theme.white,
        borderWidth: 1,
        borderColor: theme.border,
    },
    filterChipActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    filterText: {
        fontSize: FontSizes.sm,
        color: theme.textSecondary,
        fontWeight: FontWeights.medium,
    },
    filterTextActive: {
        color: theme.white,
    },
    grid: {
        padding: Spacing.lg,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    mediaItem: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        backgroundColor: theme.surfaceSecondary,
    },
    mediaContainer: {
        flex: 1,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    videoThumbnailContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 8,
    },
    loader: {
        padding: Spacing.md,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 2,
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: theme.textSecondary,
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

