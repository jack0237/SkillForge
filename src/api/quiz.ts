import { supabase } from './supabase';
import { Quiz, QuizQuestion, QuizResult } from '../types';

export interface CourseQuiz {
  quiz: Quiz;
  questions: QuizQuestion[];
  previousResult: Pick<QuizResult, 'score' | 'total' | 'passed'> | null;
}

export async function getCourseQuiz(courseId: string): Promise<CourseQuiz | null> {
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, course_id, title')
    .eq('course_id', courseId)
    .maybeSingle();

  if (!quiz) return null;

  const [{ data: questions }, { data: result }] = await Promise.all([
    supabase
      .from('quiz_questions')
      .select('id, quiz_id, question, options, correct_index, position')
      .eq('quiz_id', quiz.id)
      .order('position'),
    supabase
      .from('quiz_results')
      .select('score, total, passed')
      .eq('quiz_id', quiz.id)
      .maybeSingle(),
  ]);

  if (!questions?.length) return null;

  return {
    quiz: quiz as Quiz,
    questions: questions as QuizQuestion[],
    previousResult: result ?? null,
  };
}

export async function saveQuizResult(
  quizId: string,
  userId: string,
  score: number,
  total: number,
): Promise<void> {
  const passed = total > 0 && score / total >= 0.6;
  const { error } = await supabase.from('quiz_results').upsert(
    {
      user_id: userId,
      quiz_id: quizId,
      score,
      total,
      passed,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,quiz_id' },
  );
  if (error) throw error;
}
