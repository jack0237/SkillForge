-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COURSES
-- ============================================================
create table public.courses (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  description           text,
  thumbnail_url         text,
  category              text not null,
  youtube_playlist_id   text not null,
  lesson_count          integer not null default 0,
  created_at            timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Courses are viewable by everyone"
  on public.courses for select
  using (true);

-- ============================================================
-- LESSONS
-- ============================================================
create table public.lessons (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid not null references public.courses (id) on delete cascade,
  title             text not null,
  description       text,
  youtube_video_id  text not null,
  duration_seconds  integer,
  position          integer not null,
  created_at        timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "Lessons are viewable by everyone"
  on public.lessons for select
  using (true);

create index lessons_course_id_idx on public.lessons (course_id, position);

-- ============================================================
-- PROGRESS
-- ============================================================
create table public.progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  lesson_id     uuid not null references public.lessons (id) on delete cascade,
  course_id     uuid not null references public.courses (id) on delete cascade,
  completed     boolean not null default false,
  completed_at  timestamptz,
  unique (user_id, lesson_id)
);

alter table public.progress enable row level security;

create policy "Users can manage their own progress"
  on public.progress for all
  using (auth.uid() = user_id);

create index progress_user_course_idx on public.progress (user_id, course_id);

-- ============================================================
-- NOTES
-- ============================================================
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  lesson_id   uuid not null references public.lessons (id) on delete cascade,
  content     text not null default '',
  updated_at  timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.notes enable row level security;

create policy "Users can manage their own notes"
  on public.notes for all
  using (auth.uid() = user_id);

-- ============================================================
-- QUIZZES
-- ============================================================
create table public.quizzes (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  title      text not null
);

alter table public.quizzes enable row level security;

create policy "Quizzes are viewable by everyone"
  on public.quizzes for select
  using (true);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
create table public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes (id) on delete cascade,
  question       text not null,
  options        text[] not null,
  correct_index  integer not null,
  position       integer not null
);

alter table public.quiz_questions enable row level security;

create policy "Quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (true);

create index quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id, position);

-- ============================================================
-- QUIZ RESULTS
-- ============================================================
create table public.quiz_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  quiz_id       uuid not null references public.quizzes (id) on delete cascade,
  score         integer not null,
  total         integer not null,
  passed        boolean not null,
  completed_at  timestamptz not null default now(),
  unique (user_id, quiz_id)
);

alter table public.quiz_results enable row level security;

create policy "Users can manage their own quiz results"
  on public.quiz_results for all
  using (auth.uid() = user_id);
