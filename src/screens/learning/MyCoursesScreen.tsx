import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BookOpen, Compass } from 'lucide-react-native';
import { getDashboardData, CourseProgress } from '../../api/dashboard';
import { AppTabParamList } from '../../navigation/AppNavigator';
import { CatalogStackParamList } from '../../navigation/CatalogStack';
import { colors, spacing, radius } from '../../constants/theme';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<AppTabParamList, 'My Learning'>,
    StackNavigationProp<CatalogStackParamList>
  >;
};

/* ─────────────────── Skeleton ─────────────────── */
function SkeletonBox({ w, h, r = radius.md }: { w: number | string; h: number; r?: number }) {
  const anim = useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: w as any,
        height: h,
        borderRadius: r,
        backgroundColor: colors.surfaceContainerHigh,
        opacity: anim,
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      {/* Thumbnail skeleton */}
      <SkeletonBox w="100%" h={180} r={0} />
      {/* Progress bar skeleton */}
      <SkeletonBox w="100%" h={4} r={0} />
      {/* Content */}
      <View style={styles.cardBody}>
        <SkeletonBox w="72%" h={16} />
        <SkeletonBox w="48%" h={13} />
        <View style={styles.cardFooter}>
          <SkeletonBox w="40%" h={4} r={2} />
          <SkeletonBox w={80} h={32} r={radius.full} />
        </View>
      </View>
    </View>
  );
}

/* ─────────────────── Course card ─────────────────── */
function CourseCard({
  course,
  onPress,
}: {
  course: CourseProgress;
  onPress: () => void;
}) {
  const done = course.progress_percent === 100;
  const pct = course.progress_percent;

  const barColor = done ? '#2e7d32' : pct >= 60 ? colors.primary : colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Thumbnail */}
      <View style={styles.thumbContainer}>
        {course.thumbnail_url ? (
          <Image
            source={{ uri: course.thumbnail_url }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <BookOpen size={36} color={colors.onPrimary} strokeWidth={1.5} />
          </View>
        )}

        {/* Completed badge */}
        {done && (
          <View style={styles.completedOverlay}>
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ Completed</Text>
            </View>
          </View>
        )}
      </View>

      {/* Progress bar (flush, under thumbnail) */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%` as any, backgroundColor: barColor },
          ]}
        />
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {course.title}
        </Text>

        {/* Subtitle: completed lessons */}
        <Text style={styles.cardSubtitle}>
          {course.completed_lessons} of {course.lesson_count} lessons completed
        </Text>

        {/* Footer: percent + button */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.pctLabel}>{pct}% Complete</Text>
          </View>
          <View
            style={[
              styles.continueBtn,
              done && styles.continueBtnDone,
            ]}
          >
            <Text
              style={[
                styles.continueBtnText,
                done && styles.continueBtnTextDone,
              ]}
            >
              {done ? 'Review' : 'Continue'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─────────────────── Empty state ─────────────────── */
function EmptyState({ onExplore, onBrowse }: { onExplore: () => void; onBrowse: () => void }) {
  return (
    <View style={styles.empty}>
      {/* Illustration */}
      <View style={styles.emptyIllustration}>
        <View style={styles.emptyIconBg}>
          <Text style={styles.emptyEmoji}>📚</Text>
        </View>
      </View>

      <Text style={styles.emptyTitle}>No courses started yet</Text>
      <Text style={styles.emptySubtitle}>
        Discover your next skill from our catalog.{'\n'}
        Start your learning journey today and build a better future.
      </Text>

      <TouchableOpacity style={styles.explorePrimary} onPress={onExplore} activeOpacity={0.88}>
        <Compass size={18} color={colors.onPrimary} strokeWidth={2} />
        <Text style={styles.explorePrimaryText}>Explore Catalog</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exploreSecondary} onPress={onBrowse} activeOpacity={0.7}>
        <BookOpen size={18} color={colors.primary} strokeWidth={2} />
        <Text style={styles.exploreSecondaryText}>Browse Categories</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─────────────────── Main screen ─────────────────── */
export default function MyCoursesScreen({ navigation }: Props) {
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getDashboardData();
      setCourses(data.courses);
    } catch {
      /* silently ignore — user can pull to refresh */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const goToCourse = useCallback(
    (course: CourseProgress) => {
      (navigation as any).navigate('Catalog', {
        screen: 'CourseDetail',
        params: {
          playlistId: course.youtube_playlist_id,
          title: course.title,
          description: '',
          thumbnail_url: course.thumbnail_url,
          lesson_count: course.lesson_count,
        },
      });
    },
    [navigation],
  );

  const goToCatalog = useCallback(() => {
    (navigation as any).navigate('Catalog');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {loading ? 'My Courses' : courses.length > 0 ? 'In Progress' : 'My Courses'}
            </Text>
            {!loading && courses.length > 0 && (
              <Text style={styles.headerSubtitle}>
                Pick up where you left off and keep learning.
              </Text>
            )}
          </View>
          {!loading && courses.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{courses.length}</Text>
            </View>
          )}
        </View>

        {/* ── Content ── */}
        {loading ? (
          /* Skeleton */
          <View style={styles.list}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : courses.length === 0 ? (
          /* Empty */
          <EmptyState onExplore={goToCatalog} onBrowse={goToCatalog} />
        ) : (
          /* List */
          <View style={styles.list}>
            {courses.map((course) => (
              <CourseCard
                key={course.course_id}
                course={course}
                onPress={() => goToCourse(course)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────── Styles ─────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.margin,
    paddingBottom: spacing.xl,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerText: { flex: 1, gap: spacing.xs },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 21,
  },
  countBadge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginTop: 4,
  },
  countBadgeText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  /* List */
  list: { gap: spacing.md },

  /* Card */
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  thumbContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceContainerHigh,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#2e7d32',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Progress bar */
  progressTrack: {
    height: 5,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    height: '100%',
  },

  /* Card body */
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.2,
    lineHeight: 23,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  footerLeft: { flex: 1 },
  pctLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  continueBtnDone: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  continueBtnText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  continueBtnTextDone: {
    color: colors.onSurfaceVariant,
  },

  /* Empty state */
  empty: {
    paddingTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIllustration: {
    marginBottom: spacing.sm,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: spacing.md,
  },
  explorePrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    width: '100%',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  explorePrimaryText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  exploreSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  exploreSecondaryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
