-- Stores complete anonymous survey submissions for the public survey application.
create extension if not exists pgcrypto;

create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_version text not null default '1.0',
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  constraint survey_responses_answers_is_object check (jsonb_typeof(answers) = 'object'),
  constraint survey_responses_version_not_empty check (length(trim(survey_version)) > 0)
);

create index survey_responses_submitted_at_idx
  on public.survey_responses (submitted_at desc);

alter table public.survey_responses enable row level security;

revoke all on table public.survey_responses from anon, authenticated;
grant select, insert on table public.survey_responses to anon;

create policy "anonymous users can submit complete survey payloads"
  on public.survey_responses
  for insert
  to anon
  with check (
    jsonb_typeof(answers) = 'object'
    and answers ?& array[
      'q01','q02','q03','q04','q05','q06','q07','q08','q09','q10','q11',
      'q12','q13','q14','q15','q16','q17','q18','q19','q20','q21','q22',
      'q23','q24','q25','q26','q27','q28','q29','q30','q31','q32','q33',
      'q34','q35','q36','q37','q38','q39','q40','q41','q42','q43','q44'
    ]
  );

create policy "anonymous users can read public survey results"
  on public.survey_responses
  for select
  to anon
  using (true);
