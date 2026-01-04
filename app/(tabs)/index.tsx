import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Calendar, Search, MapPin, Play, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';
import * as schema from '@/db/schema';
import FAB from '@/components/FAB';
import MoodIcon from '@/components/MoodIcon';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ENTRIES_PER_PAGE = 10;

// Helper function to strip HTML tags and decode entities for preview
const stripHtmlTags = (html: string | null): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&')  // Replace &amp; with &
    .replace(/&lt;/g, '<')   // Replace &lt; with <
    .replace(/&gt;/g, '>')   // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'")  // Replace &#39; with '
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10))) // Decode numeric entities (emojis)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16))) // Decode hex entities
    .replace(/\s+/g, ' ')    // Collapse multiple spaces
    .trim();
};

interface DisplayEntry {
  id: string;
  title: string;
  content: string | null;
  mood: string | null;
  location?: string | null;
  tags: string[] | null;
  createdAt: string;
  image?: string;
  emoji?: string;
  hasAudio?: boolean;
  audioDuration?: string;
}

// const sampleEntries: DisplayEntry[] = [
//   {
//     id: '1',
//     title: 'Beach Day Adventure with Shyma',
//     content: 'Today was absolutely incredible. The water was crystal clear and the sun...',
//     mood: 'happy',
//     location: 'Malibu, CA',
//     tags: ['travel', 'joy'],
//     createdAt: new Date().toISOString(),
//     image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
//   },
//   {
//     id: '2',
//     title: 'Coffee with Dina',
//     content: 'Finally caught up with Sarah! We talked for hours about her new job and the upcoming trip. The latte art was...',
//     mood: 'grateful',
//     tags: ['friends'],
//     createdAt: new Date(Date.now() - 86400000).toISOString(),
//     emoji: 'coffee',
//   },
//   {
//     id: '3',
//     title: 'A bit anxious',
//     content: "Work has been piling up lately and I'm feeling the pressure. Took a moment...",
//     mood: 'anxious',
//     tags: ['personal'],
//     createdAt: new Date(Date.now() - 172800000).toISOString(),
//     hasAudio: true,
//     audioDuration: '0:45',
//   },
// ];
const sampleEntries: DisplayEntry[] = [];

export default function JournalTimelineScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { entries, searchEntries, getAllMedia } = useDatabase();
  const insets = useSafeAreaInsets();
  const [media, setMedia] = useState<schema.EntryMedia[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [displayCount, setDisplayCount] = useState(ENTRIES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DisplayEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchEntries(searchQuery);
          setSearchResults(
            results.map((e) => {
              const entryMedia = media.find((m) => m.entryId === e.id && (m.type === 'image' || m.type === 'video'));
              return {
                ...e,
                tags: e.tags ? JSON.parse(e.tags) : null,
                image: entryMedia?.uri,
                createdAt: e.createdAt,
              };
            })
          );
        } catch (error) {
          console.warn('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchEntries]);

  useFocusEffect(
    useCallback(() => {
      getAllMedia().then(setMedia);
    }, [getAllMedia])
  );

  const allEntries: DisplayEntry[] = useMemo(() => {
    if (entries.length > 0) {
      return entries.map((e) => {
        const entryMedia = media.find((m) => m.entryId === e.id && (m.type === 'image' || m.type === 'video'));
        return {
          ...e,
          tags: e.tags ? JSON.parse(e.tags) : null,
          image: entryMedia?.uri,
          createdAt: e.createdAt,
        };
      });
    }
    return sampleEntries;
  }, [entries, media]);

  const filteredEntries = useMemo(() => {
    if (!selectedDate) {
      return allEntries;
    }

    const selectedDateStr = selectedDate.toDateString();
    return allEntries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.toDateString() === selectedDateStr;
    });
  }, [allEntries, selectedDate]);

  const displayedEntries = useMemo(() => {
    return filteredEntries.slice(0, displayCount);
  }, [filteredEntries, displayCount]);

  const hasMoreEntries = displayCount < filteredEntries.length;

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  const currentMonthYear = useMemo(() => {
    const midWeek = new Date(currentWeekStart);
    midWeek.setDate(midWeek.getDate() + 3);
    return midWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentWeekStart]);

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleDateSelect = (date: Date) => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
    setDisplayCount(ENTRIES_PER_PAGE);
  };

  const loadMoreEntries = useCallback(() => {
    if (isLoadingMore || !hasMoreEntries) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + ENTRIES_PER_PAGE);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMoreEntries]);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreEntries();
    }
  }, [loadMoreEntries]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDayInfo = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: WEEK_DAYS[date.getDay()].toUpperCase(),
      date: date.getDate(),
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const groupEntriesByDate = () => {
    const grouped: Record<string, DisplayEntry[]> = {};
    displayedEntries.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    return grouped;
  };

  const groupedEntries = groupEntriesByDate();

  const handleNewEntry = () => {
    router.push('/entry/new');
  };

  const handleEntryPress = (id: string) => {
    router.push(`/entry/${id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.calendarButton}>
          <Calendar size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{currentMonthYear}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>My Journal</Text>
        </View>
        <Pressable style={styles.searchButton} onPress={() => setShowSearchModal(true)}>
          <Search size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.weekNavigation, { backgroundColor: theme.surface, borderBottomColor: theme.borderLight }]}>
        <Pressable style={styles.weekNavButton} onPress={handlePreviousWeek}>
          <ChevronLeft size={20} color={theme.textSecondary} />
        </Pressable>
        <View style={styles.weekStrip}>
          {weekDates.map((date, index) => {
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isTodayDate = isToday(date);
            return (
              <Pressable
                key={index}
                style={[
                  styles.dayItem,
                  isSelected && { backgroundColor: theme.primary },
                  isTodayDate && !isSelected && { borderWidth: 1, borderColor: theme.primary },
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text style={[
                  styles.dayName,
                  { color: theme.textSecondary },
                  isSelected && { color: theme.white },
                  isTodayDate && !isSelected && { color: theme.primary },
                ]}>
                  {WEEK_DAYS[date.getDay()]}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  { color: theme.text },
                  isSelected && { color: theme.white },
                  isTodayDate && !isSelected && { color: theme.primary },
                ]}>
                  {date.getDate().toString().padStart(2, '0')}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.weekNavButton} onPress={handleNextWeek}>
          <ChevronRight size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      {selectedDate && (
        <View style={[styles.filterBadge, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.filterBadgeText, { color: theme.textSecondary }]}>
            Showing entries for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Pressable onPress={() => setSelectedDate(null)}>
            <Text style={[styles.clearFilterText, { color: theme.primary }]}>Show All</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        style={styles.timeline}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {Object.keys(groupedEntries).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No entries yet</Text>
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              {selectedDate
                ? 'No entries for this day. Tap + to create one!'
                : 'Start journaling by tapping the + button below'}
            </Text>
          </View>
        ) : (
          Object.entries(groupedEntries).map(([dateKey, dateEntries]) => {
            const dayInfo = getDayInfo(dateEntries[0].createdAt);
            return (
              <View key={dateKey} style={styles.timelineSection}>
                {dateEntries.map((entry, index) => (
                  <View key={entry.id} style={styles.timelineRow}>
                    <View style={styles.timelineSidebar}>
                      {index === 0 && (
                        <>
                          <Text style={[styles.sidebarDay, { color: theme.textSecondary }]}>{dayInfo.day}</Text>
                          <Text style={[styles.sidebarDate, { color: theme.text }]}>{dayInfo.date}</Text>
                        </>
                      )}
                      <View style={styles.timelineLine}>
                        <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
                        {index < dateEntries.length - 1 && <View style={[styles.lineSegment, { backgroundColor: theme.border }]} />}
                      </View>
                    </View>

                    <Pressable
                      style={[styles.entryCard, { backgroundColor: theme.surface }]}
                      onPress={() => handleEntryPress(entry.id)}
                    >
                      <View style={styles.entryHeader}>
                        <Text style={[styles.entryTitle, { color: theme.text }]}>{entry.title}</Text>
                        <MoodIcon mood={entry.mood || 'neutral'} size={28} />
                      </View>

                      <Text style={[styles.entryContent, { color: theme.textSecondary }]} numberOfLines={2}>
                        {stripHtmlTags(entry.content)}
                      </Text>

                      {'image' in entry && entry.image && (
                        <View style={styles.entryImageContainer}>
                          <Image source={{ uri: entry.image }} style={styles.entryImage} resizeMode="cover" />
                          {entry.location && (
                            <View style={styles.locationBadge}>
                              <MapPin size={12} color={theme.white} />
                              <Text style={[styles.locationText, { color: theme.white }]}>{entry.location}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {'hasAudio' in entry && entry.hasAudio && (
                        <View style={[styles.audioPlayer, { backgroundColor: theme.surfaceSecondary }]}>
                          <Play size={16} color={theme.primary} />
                          <View style={[styles.audioProgress, { backgroundColor: theme.border }]}>
                            <View style={[styles.audioProgressFill, { backgroundColor: theme.primary }]} />
                          </View>
                          <Text style={[styles.audioDuration, { color: theme.textSecondary }]}>{entry.audioDuration}</Text>
                        </View>
                      )}

                      <View style={styles.entryFooter}>
                        <Text style={[styles.entryTime, { color: theme.primary }]}>{formatTime(entry.createdAt)}</Text>
                        <View style={styles.tags}>
                          {entry.tags?.map((tag: string) => (
                            <View key={tag} style={[styles.tag, { backgroundColor: theme.surfaceSecondary }]}>
                              <Text style={[styles.tagText, { color: theme.textSecondary }]}>#{tag}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>
            );
          })
        )}

        {isLoadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.loadingMoreText, { color: theme.textSecondary }]}>Loading more entries...</Text>
          </View>
        )}

        {!hasMoreEntries && displayedEntries.length > 0 && (
          <View style={styles.timelineEnd}>
            <View style={styles.timelineEndDots}>
              <View style={[styles.endDot, { backgroundColor: theme.border }]} />
              <View style={[styles.endDot, { backgroundColor: theme.border }]} />
              <View style={[styles.endDot, { backgroundColor: theme.border }]} />
            </View>
            <Text style={[styles.timelineEndText, { color: theme.textTertiary }]}>
              {selectedDate ? 'End of entries for this day' : 'End of journal'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB onPress={handleNewEntry} style={{ position: 'absolute', bottom: 24, right: 24, marginBottom: 0 }} />

      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <SafeAreaView style={[styles.searchModalContainer, { backgroundColor: theme.background }]} edges={['top']}>
          <View style={styles.searchHeader}>
            <View style={[styles.searchInputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Search size={20} color={theme.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search journal entries..."
                placeholderTextColor={theme.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={handleClearSearch}>
                  <X size={20} color={theme.textTertiary} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={() => setShowSearchModal(false)}>
              <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
            </Pressable>
          </View>

          {isSearching ? (
            <View style={styles.searchLoadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.searchLoadingText, { color: theme.textSecondary }]}>Searching...</Text>
            </View>
          ) : searchQuery.length === 0 ? (
            <View style={styles.searchEmptyContainer}>
              <Search size={48} color={theme.textTertiary} />
              <Text style={[styles.searchEmptyTitle, { color: theme.text }]}>Search Your Journal</Text>
              <Text style={[styles.searchEmptyText, { color: theme.textSecondary }]}>
                Find entries by title, content, tags, or mood
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.searchEmptyContainer}>
              <Text style={[styles.searchEmptyTitle, { color: theme.text }]}>No Results</Text>
              <Text style={[styles.searchEmptyText, { color: theme.textSecondary }]}>
                No entries found for "{searchQuery}"
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.searchResults}>
              {searchResults.map((entry) => (
                <Pressable
                  key={entry.id}
                  style={[styles.searchResultItem, { backgroundColor: theme.surface }]}
                  onPress={() => {
                    setShowSearchModal(false);
                    handleEntryPress(entry.id);
                  }}
                >
                  <View style={styles.searchResultHeader}>
                    <View style={styles.searchResultTitleRow}>
                      <Text style={[styles.searchResultTitle, { color: theme.text }]}>{entry.title}</Text>
                      <MoodIcon mood={entry.mood || 'neutral'} size={24} />
                    </View>
                    <Text style={[styles.searchResultDate, { color: theme.textSecondary }]}>
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {entry.content && (
                    <Text style={[styles.searchResultContent, { color: theme.textSecondary }]} numberOfLines={2}>
                      {stripHtmlTags(entry.content)}
                    </Text>
                  )}
                  {entry.tags && entry.tags.length > 0 && (
                    <View style={styles.searchResultTags}>
                      {entry.tags.slice(0, 3).map((tag: string) => (
                        <View key={tag} style={[styles.searchResultTag, { backgroundColor: theme.surfaceSecondary }]}>
                          <Text style={[styles.searchResultTagText, { color: theme.textSecondary }]}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  calendarButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
  },
  searchButton: {
    padding: Spacing.xs,
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: Spacing.xs,
  },
  weekNavButton: {
    padding: Spacing.sm,
  },
  weekStrip: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginHorizontal: 2,
  },
  dayName: {
    fontSize: FontSizes.xs,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  filterBadgeText: {
    fontSize: FontSizes.sm,
  },
  clearFilterText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  timeline: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  timelineSection: {
    marginBottom: Spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
  },
  timelineSidebar: {
    width: 60,
    alignItems: 'center',
  },
  sidebarDay: {
    fontSize: FontSizes.xs,
    marginBottom: 2,
  },
  sidebarDate: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.sm,
  },
  timelineLine: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  lineSegment: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  entryCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
    ...Shadows.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  entryContent: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  entryImageContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  entryImage: {
    width: '100%',
    height: 140,
  },
  locationBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  locationText: {
    fontSize: FontSizes.xs,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  audioProgress: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  audioProgressFill: {
    width: '30%',
    height: '100%',
    borderRadius: 2,
  },
  audioDuration: {
    fontSize: FontSizes.xs,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTime: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: FontSizes.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingMoreText: {
    fontSize: FontSizes.sm,
  },
  timelineEnd: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  timelineEndDots: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  endDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  timelineEndText: {
    fontSize: FontSizes.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
  },
  searchModalContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  cancelText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  searchLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  searchLoadingText: {
    fontSize: FontSizes.md,
  },
  searchEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  searchEmptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchEmptyText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  searchResultHeader: {
    marginBottom: Spacing.xs,
  },
  searchResultTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  searchResultTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  searchResultDate: {
    fontSize: FontSizes.sm,
  },
  searchResultContent: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  searchResultTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  searchResultTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  searchResultTagText: {
    fontSize: FontSizes.xs,
  },
});
