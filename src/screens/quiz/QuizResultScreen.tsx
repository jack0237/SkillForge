import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { CatalogStackParamList } from '../../navigation/CatalogStack';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<CatalogStackParamList, 'QuizResult'>;
  route: RouteProp<CatalogStackParamList, 'QuizResult'>;
};

export default function QuizResultScreen({ navigation, route }: Props) {
  const { quizId, score, total, passed, courseTitle, playlistId } = route.params;
  const { user } = useAuth();
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const userName = user?.user_metadata?.full_name ?? user?.email ?? 'Student';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Score circle */}
        <View style={[styles.scoreCircle, passed ? styles.scoreCirclePassed : styles.scoreCircleFailed]}>
          <Text style={[styles.scoreNumber, passed ? styles.scoreNumberPassed : styles.scoreNumberFailed]}>
            {score}/{total}
          </Text>
          <Text style={[styles.scorePercent, passed ? styles.scorePercentPassed : styles.scorePercentFailed]}>
            {percent}%
          </Text>
        </View>

        {/* Badge */}
        <View style={[styles.badge, passed ? styles.badgePassed : styles.badgeFailed]}>
          <Text style={[styles.badgeText, passed ? styles.badgeTextPassed : styles.badgeTextFailed]}>
            {passed ? '🎉 Passed' : '✗ Not Passed'}
          </Text>
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>
            {passed ? 'Excellent work!' : 'Keep learning!'}
          </Text>
          <Text style={styles.messageBody}>
            {passed
              ? `You answered ${score} out of ${total} questions correctly. You've earned your certificate!`
              : `You answered ${score} out of ${total} correctly. You need 60% to pass. Review the lessons and try again.`
            }
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{total - score}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{percent}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {passed ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate('Certificate', {
                userName,
                courseTitle,
                score,
                total,
                completedAt: new Date().toISOString(),
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get Certificate →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.replace('Quiz', {
                courseId: route.params.quizId,
                courseTitle,
                playlistId,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Retake Quiz</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate('CourseDetail', {
              playlistId,
              title: courseTitle,
              description: '',
              thumbnail_url: null,
              lesson_count: 0,
            })
          }
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Back to Course</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.margin,
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  scoreCirclePassed: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  scoreCircleFailed: { borderColor: colors.error, backgroundColor: colors.errorContainer },
  scoreNumber: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  scoreNumberPassed: { color: '#1b5e20' },
  scoreNumberFailed: { color: colors.error },
  scorePercent: { fontSize: 14, fontWeight: '600' },
  scorePercentPassed: { color: '#2e7d32' },
  scorePercentFailed: { color: colors.error },
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  badgePassed: { backgroundColor: '#e8f5e9' },
  badgeFailed: { backgroundColor: colors.errorContainer },
  badgeText: { fontSize: 15, fontWeight: '700' },
  badgeTextPassed: { color: '#1b5e20' },
  badgeTextFailed: { color: colors.error },
  messageContainer: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  messageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.4,
  },
  messageBody: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.onSurface, letterSpacing: -0.4 },
  statLabel: { fontSize: 12, color: colors.onSurfaceVariant, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: colors.outlineVariant },
  actions: {
    paddingHorizontal: spacing.margin,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: { color: colors.onSurfaceVariant, fontSize: 14, fontWeight: '500' },
});
