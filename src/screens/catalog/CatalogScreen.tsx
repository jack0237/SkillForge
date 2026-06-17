import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { YouTubeCourse, searchPlaylists } from '../../api/youtube';
import CourseCard from '../../components/CourseCard';
import { useDebounce } from '../../hooks/useDebounce';
import { colors, spacing, radius } from '../../constants/theme';
import { CatalogStackParamList } from '../../navigation/CatalogStack';

type Props = {
  navigation: StackNavigationProp<CatalogStackParamList, 'CatalogHome'>;
};

const CATEGORIES = ['All', 'Programming', 'Design', 'Business', 'Science', 'Mathematics', 'Languages'];

function buildQuery(query: string, category: string): string {
  const q = query.trim();
  const cat = category === 'All' ? '' : category;
  if (!q && !cat) return 'programming tutorial';
  if (!q) return `${cat} tutorial`;
  if (!cat) return q;
  return `${q} ${cat}`;
}

export default function CatalogScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courses, setCourses] = useState<YouTubeCourse[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const debouncedQuery = useDebounce(query, 500);

  const fetchCourses = useCallback(async (q: string, cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchPlaylists(buildQuery(q, cat));
      setCourses(result.items);
      setNextPageToken(result.nextPageToken);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(debouncedQuery, selectedCategory);
  }, [debouncedQuery, selectedCategory, fetchCourses]);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const result = await searchPlaylists(buildQuery(debouncedQuery, selectedCategory), nextPageToken);
      setCourses((prev) => [...prev, ...result.items]);
      setNextPageToken(result.nextPageToken);
    } catch {
      // silently fail on pagination errors
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, loadingMore, loading, debouncedQuery, selectedCategory]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCourses([]);
    setNextPageToken(undefined);
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.heading}>Explore</Text>

        {/* Search bar */}
        <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
          <Search size={18} color={searchFocused ? colors.primary : colors.outline} strokeWidth={2} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search courses..."
            placeholderTextColor={colors.outline}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={colors.outline} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
              onPress={() => handleCategorySelect(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchCourses(debouncedQuery, selectedCategory)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.youtube_playlist_id}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() =>
                navigation.navigate('CourseDetail', {
                  playlistId: item.youtube_playlist_id,
                  title: item.title,
                  description: item.description,
                  thumbnail_url: item.thumbnail_url,
                  lesson_count: item.lesson_count,
                })
              }
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No courses found.</Text>
                <Text style={styles.emptySubtext}>Try a different search or category.</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchBarFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  categoriesContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
  list: {
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  errorBox: {
    marginHorizontal: spacing.margin,
    marginTop: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: colors.onErrorContainer,
    fontSize: 13,
    flex: 1,
  },
  retryText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: spacing.md,
  },
});
