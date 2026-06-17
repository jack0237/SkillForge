import { supabase } from './supabase';

export interface CourseProgress {
  course_id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  youtube_playlist_id: string;
  lesson_count: number;
  completed_lessons: number;
  progress_percent: number;
  last_watched_at: string;
}

export interface DashboardData {
  courses: CourseProgress[];
  streak: number;
  total_completed: number;
}

export async function getDashboardData(): Promise<DashboardData> {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      course_id,
      completed_at,
      courses (
        id,
        title,
        description,
        category,
        thumbnail_url,
        lesson_count,
        youtube_playlist_id
      )
    `)
    .eq('completed', true)
    .order('completed_at', { ascending: false });

  if (error) throw error;

  const courseMap = new Map<string, CourseProgress>();
  const allDates: string[] = [];

  for (const row of data ?? []) {
    const course = (row as any).courses;
    if (!course) continue;
    if (row.completed_at) allDates.push(row.completed_at as string);

    if (!courseMap.has(row.course_id)) {
      courseMap.set(row.course_id, {
        course_id: row.course_id,
        title: course.title,
        description: course.description ?? null,
        category: course.category ?? null,
        thumbnail_url: course.thumbnail_url,
        youtube_playlist_id: course.youtube_playlist_id,
        lesson_count: course.lesson_count ?? 0,
        completed_lessons: 0,
        progress_percent: 0,
        last_watched_at: row.completed_at ?? '',
      });
    }

    const entry = courseMap.get(row.course_id)!;
    entry.completed_lessons++;
    if (entry.lesson_count > 0) {
      entry.progress_percent = Math.min(
        100,
        Math.round((entry.completed_lessons / entry.lesson_count) * 100),
      );
    }
  }

  const courses = Array.from(courseMap.values()).sort((a, b) =>
    b.last_watched_at.localeCompare(a.last_watched_at),
  );

  return {
    courses,
    streak: calculateStreak(allDates),
    total_completed: allDates.length,
  };
}

function calculateStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;

  const uniqueDays = [
    ...new Set(completedDates.map((d) => d.split('T')[0])),
  ].sort().reverse();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const a = new Date(uniqueDays[i - 1]);
    const b = new Date(uniqueDays[i]);
    const diffDays = Math.round((a.getTime() - b.getTime()) / 86_400_000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}
