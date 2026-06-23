import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Award, BookOpen, Clock, Flame, LogOut } from 'lucide-react-native';
import { supabase } from '../../api/supabase';
import { getDashboardData } from '../../api/dashboard';
import { colors, spacing, radius } from '../../constants/theme';

/* ─────────────────── helpers ─────────────────── */

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1w ago';
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

type ActivityIcon = 'cert' | 'streak' | 'book';

type ActivityItem = {
  id: string;
  icon: ActivityIcon;
  title: string;
  subtitle: string;
  date: string;
};

function ActivityIconView({ type }: { type: ActivityIcon }) {
  if (type === 'streak') {
    return (
      <View style={[styles.activityIconWrap, { backgroundColor: colors.secondaryContainer }]}>
        <Flame size={22} color={colors.onSecondaryContainer} strokeWidth={2} />
      </View>
    );
  }
  if (type === 'cert') {
    return (
      <View style={[styles.activityIconWrap, { backgroundColor: '#a3320018' }]}>
        <Award size={22} color={colors.tertiary} strokeWidth={2} />
      </View>
    );
  }
  return (
    <View style={[styles.activityIconWrap, { backgroundColor: '#0050cb12' }]}>
      <BookOpen size={22} color={colors.primary} strokeWidth={2} />
    </View>
  );
}

/* ─────────────────── screen ─────────────────── */

export default function ProfileScreen() {
  const [userName, setUserName] = useState('');
  const [coursesCompleted, setCoursesCompleted] = useState(0);
  const [hoursLearned, setHoursLearned] = useState(0);
  const [certificates, setCertificates] = useState(0);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: authData }, dashData] = await Promise.all([
        supabase.auth.getUser(),
        getDashboardData(),
      ]);

      if (authData.user) {
        const name =
          authData.user.user_metadata?.full_name ??
          authData.user.user_metadata?.name ??
          authData.user.email?.split('@')[0] ??
          'Learner';
        setUserName(String(name));
      }

      const completed = dashData.courses.filter(c => c.progress_percent === 100).length;
      setCoursesCompleted(completed);
      setHoursLearned(Math.round((dashData.total_completed * 8) / 60));
      setCertificates(completed);

      // Build activity feed from real data
      const items: ActivityItem[] = [];

      if (dashData.streak >= 7) {
        items.push({
          id: 'streak',
          icon: 'streak',
          title: `${dashData.streak} Day Streak`,
          subtitle: 'Consistency is key!',
          date: 'Today',
        });
      }

      for (const course of dashData.courses.slice(0, 3)) {
        if (course.progress_percent === 100) {
          items.push({
            id: `cert-${course.course_id}`,
            icon: 'cert',
            title: `${course.title} Certificate`,
            subtitle: 'SkillForge Professional Series',
            date: timeAgo(course.last_watched_at),
          });
        } else {
          items.push({
            id: `progress-${course.course_id}`,
            icon: 'book',
            title: course.title,
            subtitle: `${course.completed_lessons} of ${course.lesson_count} lessons`,
            date: timeAgo(course.last_watched_at),
          });
        }
      }

      setActivityItems(items.slice(0, 3));
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }, []);

  const initials = userName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User identity ── */}
        <View style={styles.identity}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarBorder}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{loading ? '…' : initials}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.userName}>{loading ? '...' : userName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Pro Learner</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsSection}>
          {/* Full-width: courses completed */}
          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={styles.statIconWide}>
              <BookOpen size={26} color={colors.primary} strokeWidth={1.8} />
            </View>
            <View>
              <Text style={styles.statValue}>{loading ? '—' : coursesCompleted}</Text>
              <Text style={styles.statLabel}>Courses Completed</Text>
            </View>
          </View>

          {/* Half-width row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Clock size={22} color={colors.tertiary} strokeWidth={1.8} />
              <Text style={styles.statValue}>{loading ? '—' : hoursLearned}</Text>
              <Text style={styles.statLabel}>Hours Learned</Text>
            </View>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Award
                size={22}
                color={colors.primary}
                strokeWidth={1.8}
                fill={colors.primary}
              />
              <Text style={styles.statValue}>{loading ? '—' : certificates}</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>
          </View>
        </View>

        {/* ── Recent Activity ── */}
        {activityItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {activityItems.map(item => (
                <View key={item.id} style={styles.activityItem}>
                  <ActivityIconView type={item.icon} />
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.activitySub} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text style={styles.activityDate}>{item.date}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── SkillForge Plus banner ── */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Unlock SkillForge Plus</Text>
          <Text style={styles.bannerSub}>
            Get unlimited access to 500+ premium courses and professional certificates.
          </Text>
          <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.88}>
            <Text style={styles.bannerBtnText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <LogOut size={18} color={colors.error} strokeWidth={2} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────── styles ─────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  /* Identity */
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: colors.primary,
  },
  avatarBorder: {
    flex: 1,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: colors.background,
    overflow: 'hidden',
  },
  avatarCircle: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: colors.onPrimaryContainer,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.4,
  },
  roleBadge: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  roleBadgeText: {
    color: colors.onSecondaryContainer,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.05,
  },

  /* Stats */
  statsSection: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}33`,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statCardHalf: {
    flex: 1,
    gap: spacing.sm,
  },
  statIconWide: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: '#0050cb12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },

  /* Section */
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.2,
  },

  /* Activity */
  activityList: {
    gap: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1a`,
  },
  activityIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  activitySub: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  activityDate: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.outline,
    letterSpacing: 0.05,
  },

  /* SkillForge Plus banner */
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl + 4,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: -0.3,
  },
  bannerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
  },
  bannerBtn: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  /* Sign out */
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: `${colors.error}40`,
    backgroundColor: `${colors.error}08`,
  },
  signOutText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
});
