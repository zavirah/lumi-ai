-- Add this once in the Supabase SQL Editor to sync course progress per account.
create table if not exists public.course_progress (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  courses jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.course_progress enable row level security;
revoke all on table public.course_progress from anon;
grant select, insert, update on table public.course_progress to authenticated;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'course_progress'
      and policyname = 'Users can read their own course progress'
  ) then
    create policy "Users can read their own course progress"
      on public.course_progress for select to authenticated
      using ((select auth.uid()) = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'course_progress'
      and policyname = 'Users can create their own course progress'
  ) then
    create policy "Users can create their own course progress"
      on public.course_progress for insert to authenticated
      with check ((select auth.uid()) = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'course_progress'
      and policyname = 'Users can update their own course progress'
  ) then
    create policy "Users can update their own course progress"
      on public.course_progress for update to authenticated
      using ((select auth.uid()) = owner_id)
      with check ((select auth.uid()) = owner_id);
  end if;
end $$;
