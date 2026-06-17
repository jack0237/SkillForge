import { supabase } from './supabase';

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNote(lessonId: string): Promise<string> {
  const { data } = await supabase
    .from('notes')
    .select('content')
    .eq('lesson_id', lessonId)
    .maybeSingle();
  return data?.content ?? '';
}

export async function saveNote(
  lessonId: string,
  content: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from('notes').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  );
  if (error) throw error;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function getLessonCompleted(lessonId: string): Promise<boolean> {
  const { data } = await supabase
    .from('progress')
    .select('completed')
    .eq('lesson_id', lessonId)
    .maybeSingle();
  return data?.completed ?? false;
}

export async function markLessonComplete(
  lessonId: string,
  courseId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from('progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  );
  if (error) throw error;
}
