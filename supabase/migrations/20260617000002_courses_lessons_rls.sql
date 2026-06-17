-- courses: allow authenticated users to insert/update (sync from YouTube)
create policy "Authenticated users can insert courses"
  on public.courses for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update courses"
  on public.courses for update
  using (auth.role() = 'authenticated');

-- lessons: same
create policy "Authenticated users can insert lessons"
  on public.lessons for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update lessons"
  on public.lessons for update
  using (auth.role() = 'authenticated');
