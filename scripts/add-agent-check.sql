-- Keeps each Agent answer's fact-check result, so accuracy can be measured.
-- Run after add-agent.sql. Safe to run again.
alter table public.agent_messages add column if not exists check_result jsonb;

-- Accuracy over the last 30 days (run any time):
-- select count(*) filter (where (check_result->>'ok')::boolean) * 100.0 / nullif(count(*), 0) as first_try_correct_pct,
--        count(*) as answers
-- from public.agent_messages
-- where role = 'assistant' and check_result is not null and created_at > now() - interval '30 days';
