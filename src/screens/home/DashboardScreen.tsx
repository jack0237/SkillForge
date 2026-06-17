import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Flame, PlayCircle, Code2, Palette, BookOpen, ChevronRight } from 'lucide-react-native';
import { getDashboardData, CourseProgress, DashboardData } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';
import { AppTabParamList } from '../../../src/navigation/AppNavigator';
import { CatalogStackParamList } from '../../navigation/CatalogStack';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<AppTabParamList, 'Home'>,
    StackNavigationProp<CatalogStackParamList>
  >;
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── Streak Card ───────────────────────────── */
function StreakCard({ streak }: { streak: number }) {
  return (
    <View style={styles.streakCard}>
      <View style={styles.streakIconWrap}>
        <Flame size={22} color={colors.tertiaryContainer} strokeWidth={2} fill={colors.tertiaryContainer} />
      </View>
      <View>
        <Text style={styles.streakLabel}>DAILY STREAK</Text>
        <View style={styles.streakValueRow}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakUnit}> days</Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Course card ───────────────────────────── */
function CourseCard({
  course,
  isPrimary,
  onPress,
}: {
  course: CourseProgress;
  isPrimary: boolean;
  onPress: () => void;
}) {
  const pct = course.progress_percent;
  const done = pct === 100;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        {course.thumbnail_url ? (
          <Image
            source={{ uri: course.thumbnail_url }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <BookOpen size={40} color={colors.onPrimary} strokeWidth={1.5} />
          </View>
        )}

        {/* Category chip */}
        {course.category ? (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{course.category}</Text>
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{course.title}</Text>

        {course.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {course.description}
          </Text>
        ) : null}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressPct, done && styles.progressPctDone]}>
              {pct}% Completed
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%` as any },
                done && { backgroundColor: '#2e7d32' },
              ]}
            />
          </View>
        </View>

        {/* Resume button */}
        <TouchableOpacity
          style={[styles.resumeBtn, !isPrimary && styles.resumeBtnSecondary]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <PlayCircle
            size={18}
            color={isPrimary ? colors.onPrimary : colors.onSurface}
            strokeWidth={2}
          />
          <Text style={[styles.resumeBtnText, !isPrimary && styles.resumeBtnTextSecondary]}>
            {done ? 'Review Course' : 'Resume Course'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Explore Paths ─────────────────────────── */
const PATHS = [
  { label: 'Web Dev', icon: Code2, bg: '#dbe9fb', iconColor: colors.secondary },
  { label: 'Creative', icon: Palette, bg: '#ffdbd0', iconColor: colors.tertiaryContainer },
  { label: 'Data', icon: BookOpen, bg: '#e8f5e9', iconColor: '#2e7d32' },
  { label: 'AI & ML', icon: Code2, bg: '#ede7f6', iconColor: '#6200ea' },
] as const;

function ExploreGrid({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.pathGrid}>
      {PATHS.map(({ label, icon: Icon, bg, iconColor }) => (
        <TouchableOpacity
          key={label}
          style={[styles.pathCard, { backgroundColor: bg }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={[styles.pathIconWrap, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
            <Icon size={22} color={iconColor} strokeWidth={2} />
          </View>
          <Text style={styles.pathLabel}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ─── Main Screen ───────────────────────────── */
export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there';

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch {
      /* pull-to-refresh will let user retry */
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
          description: course.description ?? '',
          thumbnail_url: course.thumbnail_url,
          lesson_count: course.lesson_count,
        },
      });
    },
    [navigation],
  );

  const goToMyCourses = useCallback(() => {
    (navigation as any).navigate('My Learning');
  }, [navigation]);

  const goToCatalog = useCallback(() => {
    (navigation as any).navigate('Catalog');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
        {/* ── Greeting ── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            {getGreeting()}, {firstName}!
          </Text>
          <Text style={styles.greetingSubtitle}>
            Ready to forge some new skills today?
          </Text>
        </View>

        {/* ── Streak ── */}
        <StreakCard streak={loading ? 0 : (data?.streak ?? 0)} />

        {/* ── Continue Learning ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          {(data?.courses.length ?? 0) > 0 && (
            <TouchableOpacity onPress={goToMyCourses} style={styles.viewAllBtn} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={14} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          /* Loading skeleton */
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonThumb} />
            <View style={styles.skeletonBody}>
              <View style={[styles.skeletonLine, { width: '70%' }]} />
              <View style={[styles.skeletonLine, { width: '50%', height: 12 }]} />
              <View style={[styles.skeletonLine, { width: '100%', height: 6 }]} />
              <View style={[styles.skeletonLine, { width: '100%', height: 44 }]} />
            </View>
          </View>
        ) : data?.courses.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No courses started yet</Text>
            <Text style={styles.emptySubtitle}>
              Explore the catalog and watch your first lesson.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={goToCatalog} activeOpacity={0.85}>
              <Text style={styles.emptyBtnText}>Explore Catalog</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Course cards — show up to 3 most recent */
          <View style={styles.courseList}>
            {data!.courses.slice(0, 3).map((course, idx) => (
              <CourseCard
                key={course.course_id}
                course={course}
                isPrimary={idx === 0}
                onPress={() => goToCourse(course)}
              />
            ))}
          </View>
        )}

        {/* ── Explore Paths ── */}
        <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Explore Paths</Text>
        </View>
        <ExploreGrid onPress={goToCatalog} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────── Styles ─────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.margin,
    paddingBottom: spacing.xl,
  },

  /* Greeting */
  greetingSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  /* Streak card */
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  streakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.4,
  },
  streakUnit: {
    fontSize: 13,
    color: colors.outline,
    fontWeight: '400',
  },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  /* Course list */
  courseList: { gap: spacing.md },

  /* Course card */
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
  thumbWrap: {
    width: '100%',
    height: 160,
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
  categoryChip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: 0.2,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 19,
  },

  /* Progress inside card */
  progressSection: { gap: spacing.xs },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  progressPctDone: { color: '#2e7d32' },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  /* Resume button */
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
  },
  resumeBtnSecondary: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  resumeBtnText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resumeBtnTextSecondary: {
    color: colors.onSurface,
  },

  /* Skeleton */
  skeletonCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
  },
  skeletonThumb: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceContainerHigh,
  },
  skeletonBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonLine: {
    height: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  emptyBtnText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  /* Explore Paths */
  pathGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pathCard: {
    width: '47%',
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  pathIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pathLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
});
