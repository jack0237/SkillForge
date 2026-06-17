import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Clock, PlayCircle, FileQuestion, CheckCircle } from 'lucide-react-native';
import { YouTubeLesson, getPlaylistLessons } from '../../api/youtube';
import { syncCourse } from '../../api/catalog';
import { getCourseQuiz, CourseQuiz } from '../../api/quiz';
import { CatalogStackParamList, LessonSummary } from '../../navigation/CatalogStack';
import { colors, spacing, radius } from '../../constants/theme';
import { formatDuration, formatLessonCount } from '../../utils/format';

type Props = {
  navigation: StackNavigationProp<CatalogStackParamList, 'CourseDetail'>;
  route: RouteProp<CatalogStackParamList, 'CourseDetail'>;
};

export default function CourseDetailScreen({ navigation, route }: Props) {
  const { playlistId, title, description, thumbnail_url, lesson_count } = route.params;

  const [lessons, setLessons] = useState<YouTubeLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<CourseQuiz | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [lessonsResult, syncedId] = await Promise.all([
          getPlaylistLessons(playlistId),
          syncCourse(playlistId, title, { description, thumbnail_url, lesson_count }),
        ]);
        setLessons(lessonsResult.items);
        setCourseId(syncedId);

        const courseQuiz = await getCourseQuiz(syncedId);
        setQuiz(courseQuiz);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load course.');
      } finally {
        setLoading(false);
      }
    })();
  }, [playlistId]);

  const lessonSummaries: LessonSummary[] = lessons.map((l) => ({
    youtube_video_id: l.youtube_video_id,
    title: l.title,
    position: l.position,
    duration_seconds: l.duration_seconds,
  }));

  const handleLessonPress = useCallback(
    (lesson: YouTubeLesson) => {
      navigation.navigate('LessonPlayer', {
        videoId: lesson.youtube_video_id,
        title: lesson.title,
        description: lesson.description,
        position: lesson.position,
        courseTitle: title,
        playlistId,
        lessons: lessonSummaries,
      });
    },
    [navigation, title, playlistId, lessonSummaries],
  );

  const Header = (
    <View>
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={colors.onSurface} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {thumbnail_url ? (
        <Image source={{ uri: thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.thumbnailPlaceholderText}>SF</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.courseTitle}>{title}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={3}>{description}</Text>
        ) : null}
        <View style={styles.meta}>
          <PlayCircle size={14} color={colors.primary} strokeWidth={2} />
          <Text style={styles.metaText}>
            {lesson_count > 0 ? formatLessonCount(lesson_count) : formatLessonCount(lessons.length)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Lessons</Text>
    </View>
  );

  const Footer = courseId && quiz ? (
    <View style={styles.quizSection}>
      <View style={styles.divider} />
      <View style={styles.quizCard}>
        <View style={styles.quizCardLeft}>
          <View style={styles.quizIcon}>
            <FileQuestion size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle}>{quiz.quiz.title}</Text>
            <Text style={styles.quizMeta}>
              {quiz.questions.length} questions · Pass at 60%
            </Text>
            {quiz.previousResult && (
              <View style={styles.quizResult}>
                <CheckCircle
                  size={12}
                  color={quiz.previousResult.passed ? '#2e7d32' : colors.error}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.quizResultText,
                    { color: quiz.previousResult.passed ? '#2e7d32' : colors.error },
                  ]}
                >
                  {quiz.previousResult.passed ? 'Passed' : 'Failed'} —{' '}
                  {quiz.previousResult.score}/{quiz.previousResult.total}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.quizButton}
          onPress={() =>
            navigation.navigate('Quiz', {
              courseId,
              courseTitle: title,
              playlistId,
            })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.quizButtonText}>
            {quiz.previousResult ? 'Retake' : 'Start Quiz'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.container}>
          {Header}
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      ) : error ? (
        <View style={styles.container}>
          {Header}
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.youtube_video_id}
          ListHeaderComponent={Header}
          ListFooterComponent={Footer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.lessonItem}
              onPress={() => handleLessonPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.lessonIndex}>
                <Text style={styles.lessonIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.lessonBody}>
                <Text style={styles.lessonTitle} numberOfLines={2}>{item.title}</Text>
                {item.duration_seconds > 0 && (
                  <View style={styles.lessonMeta}>
                    <Clock size={12} color={colors.outline} strokeWidth={2} />
                    <Text style={styles.lessonDuration}>{formatDuration(item.duration_seconds)}</Text>
                  </View>
                )}
              </View>
              <ChevronRight size={18} color={colors.outline} strokeWidth={2} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.md,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  thumbnail: { width: '100%', aspectRatio: 16 / 9 },
  thumbnailPlaceholder: {
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: { fontSize: 36, fontWeight: '700', color: colors.onPrimary },
  info: { paddingHorizontal: spacing.margin, paddingVertical: spacing.lg, gap: spacing.sm },
  courseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  description: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginHorizontal: spacing.margin },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  lessonIndex: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  lessonIndexText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  lessonBody: { flex: 1, gap: 3 },
  lessonTitle: { fontSize: 14, fontWeight: '500', color: colors.onSurface, lineHeight: 20 },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lessonDuration: { fontSize: 12, color: colors.outline },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceContainerLow,
    marginLeft: spacing.margin + 32 + spacing.md,
  },
  listContent: { paddingBottom: spacing.xl },
  errorText: { color: colors.error, fontSize: 14 },
  quizSection: { paddingBottom: spacing.xl },
  quizCard: {
    margin: spacing.margin,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quizCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quizIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  quizInfo: { flex: 1, gap: 3 },
  quizTitle: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  quizMeta: { fontSize: 12, color: colors.onSurfaceVariant },
  quizResult: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  quizResultText: { fontSize: 12, fontWeight: '600' },
  quizButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    flexShrink: 0,
  },
  quizButtonText: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
});
