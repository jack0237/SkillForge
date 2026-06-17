-- Allow upsert by YouTube IDs without needing to know the UUID first
alter table public.courses
  add constraint courses_youtube_playlist_id_key unique (youtube_playlist_id);

alter table public.lessons
  add constraint lessons_youtube_video_id_key unique (youtube_video_id);
