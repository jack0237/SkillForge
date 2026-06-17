import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { getCourseQuiz, saveQuizResult } from '../../api/quiz';
import { useAuth } from '../../context/AuthContext';
import { QuizQuestion } from '../../types';
import { CatalogStackParamList } from '../../navigation/CatalogStack';
import { colors, spacing, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<CatalogStackParamList, 'Quiz'>;
  route: RouteProp<CatalogStackParamList, 'Quiz'>;
};

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function QuizScreen({ navigation, route }: Props) {
  const { courseId, courseTitle, playlistId } = route.params;
  const { user } = useAuth();

  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCourseQuiz(courseId)
      .then((data) => {
        if (!data) { setError('No quiz found for this course.'); return; }
        setQuizId(data.quiz.id);
        setQuestions(data.questions);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedOption !== null;
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    if (optionIndex === currentQuestion.correct_index) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = async () => {
    if (isLast) {
      if (!user) return;
      setSubmitting(true);
      const finalScore = selectedOption === currentQuestion.correct_index
        ? correctCount  // already incremented
        : correctCount;
      try {
        await saveQuizResult(quizId, user.id, finalScore, questions.length);
        navigation.replace('QuizResult', {
          quizId,
          score: finalScore,
          total: questions.length,
          passed: finalScore / questions.length >= 0.6,
          courseTitle,
          playlistId,
        });
      } catch (e: any) {
        setError(e.message);
        setSubmitting(false);
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    }
  };

  const getOptionState = (optionIndex: number): AnswerState => {
    if (selectedOption === null) return 'idle';
    if (optionIndex === currentQuestion.correct_index) return 'correct';
    if (optionIndex === selectedOption) return 'wrong';
    return 'idle';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (error || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ?? 'Quiz unavailable.'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressWidth = `${((currentIndex + 1) / questions.length) * 100}%`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={22} color={colors.onSurface} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{courseTitle}</Text>
          <Text style={styles.headerSub}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
        </View>
        <Text style={styles.score}>{correctCount} ✓</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {currentQuestion.options.map((option, idx) => {
            const state = getOptionState(idx);
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.option,
                  state === 'correct' && styles.optionCorrect,
                  state === 'wrong' && styles.optionWrong,
                  isAnswered && state === 'idle' && styles.optionDimmed,
                ]}
                onPress={() => handleSelect(idx)}
                activeOpacity={isAnswered ? 1 : 0.75}
              >
                <View style={[
                  styles.optionBullet,
                  state === 'correct' && styles.optionBulletCorrect,
                  state === 'wrong' && styles.optionBulletWrong,
                ]}>
                  <Text style={[
                    styles.optionBulletText,
                    (state === 'correct' || state === 'wrong') && styles.optionBulletTextActive,
                  ]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  state === 'correct' && styles.optionTextCorrect,
                  state === 'wrong' && styles.optionTextWrong,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback message */}
        {isAnswered && (
          <View style={[
            styles.feedback,
            selectedOption === currentQuestion.correct_index
              ? styles.feedbackCorrect
              : styles.feedbackWrong,
          ]}>
            <Text style={styles.feedbackText}>
              {selectedOption === currentQuestion.correct_index
                ? '✓ Correct!'
                : `✗ The correct answer was: ${currentQuestion.options[currentQuestion.correct_index]}`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Next / Submit button */}
      {isAnswered && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, submitting && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator color={colors.onPrimary} />
              : <Text style={styles.nextButtonText}>{isLast ? 'See Results' : 'Next Question'}</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: { color: colors.error, fontSize: 14, textAlign: 'center', paddingHorizontal: spacing.margin },
  backLink: { marginTop: spacing.sm },
  backLinkText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  headerSub: { fontSize: 12, color: colors.onSurfaceVariant },
  score: { fontSize: 14, fontWeight: '700', color: '#2e7d32', minWidth: 32, textAlign: 'right' },
  progressTrack: { height: 4, backgroundColor: colors.surfaceContainerHigh },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  scroll: { padding: spacing.margin, gap: spacing.lg, paddingBottom: spacing.xl },
  questionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  optionCorrect: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  optionWrong: { borderColor: colors.error, backgroundColor: colors.errorContainer },
  optionDimmed: { opacity: 0.45 },
  optionBullet: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  optionBulletCorrect: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  optionBulletWrong: { backgroundColor: colors.error, borderColor: colors.error },
  optionBulletText: { fontSize: 13, fontWeight: '700', color: colors.onSurfaceVariant },
  optionBulletTextActive: { color: '#fff' },
  optionText: { flex: 1, fontSize: 15, color: colors.onSurface, lineHeight: 22 },
  optionTextCorrect: { color: '#1b5e20', fontWeight: '600' },
  optionTextWrong: { color: colors.onErrorContainer, fontWeight: '600' },
  feedback: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  feedbackCorrect: { backgroundColor: '#e8f5e9', borderColor: '#a5d6a7' },
  feedbackWrong: { backgroundColor: colors.errorContainer, borderColor: '#ef9a9a' },
  feedbackText: { fontSize: 14, fontWeight: '600', color: colors.onSurface, lineHeight: 20 },
  footer: {
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  nextButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: { opacity: 0.6 },
  nextButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
});
