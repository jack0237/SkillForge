import { supabase } from './supabase';
import { YouTubeCourse, YouTubeLesson } from './youtube';

/**
 * Upserts a course by its YouTube playlist ID and returns the Supabase UUID.
 * Safe to call on every screen open — no-op if the record already exists.
 */
export async function syncCourse(
  playlistId: string,
  title: string,
  overrides?: Partial<Pick<YouTubeCourse, 'description' | 'thumbnail_url' | 'lesson_count'>>,
): Promise<string> {
  const { data, error } = await supabase
    .from('courses')
    .upsert(
      {
        youtube_playlist_id: playlistId,
        title,
        category: 'Education',
        description: overrides?.description ?? null,
        thumbnail_url: overrides?.thumbnail_url ?? null,
        lesson_count: overrides?.lesson_count ?? 0,
      },
      { onConflict: 'youtube_playlist_id' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

/**
 * Upserts a lesson by its YouTube video ID and returns the Supabase UUID.
 */
export async function syncLesson(lesson: YouTubeLesson, courseId: string): Promise<string> {
  const { data, error } = await supabase
    .from('lessons')
    .upsert(
      {
        youtube_video_id: lesson.youtube_video_id,
        course_id: courseId,
        title: lesson.title,
        description: lesson.description,
        duration_seconds: lesson.duration_seconds,
        position: lesson.position,
      },
      { onConflict: 'youtube_video_id' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}
