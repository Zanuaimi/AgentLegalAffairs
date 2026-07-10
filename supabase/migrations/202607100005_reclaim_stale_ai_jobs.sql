-- Improve stuck AI job recovery: priority claim can reclaim stale processing jobs
-- and records an explicit trace entry when that happens.

create or replace function public.claim_next_ai_review_job(stale_after_minutes integer default 2)
returns table (
  job_id uuid,
  request_id text,
  document_id uuid,
  storage_path text,
  file_name text,
  mime_type text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.ai_engine_control control
    where control.id = 'legal_affair_engine'
    and control.is_running = true
  ) then
    return;
  end if;

  return query
  with next_job as (
    select
      job.id,
      job.status as previous_status,
      job.started_at as previous_started_at,
      (
        job.status = 'processing'
        and job.started_at < now() - make_interval(mins => stale_after_minutes)
      ) as was_stale
    from public.ai_review_jobs job
    join public.legal_requests request on request.id = job.request_id
    where job.status = 'queued'
       or (
         job.status = 'processing'
         and job.started_at < now() - make_interval(mins => stale_after_minutes)
       )
    order by
      case request.priority
        when 'Urgent' then 1
        when 'High' then 2
        when 'Medium' then 3
        when 'Low' then 4
        else 5
      end asc,
      job.queue_order asc,
      job.created_at asc
    for update skip locked
    limit 1
  ), claimed as (
    update public.ai_review_jobs job
    set
      status = 'processing',
      attempt_count = job.attempt_count + 1,
      last_error = null,
      locked_at = now(),
      started_at = now(),
      current_step = case
        when next_job.was_stale then 'Reclaimed stale processing job by Legal Affair Engine'
        else 'Claimed by Legal Affair Engine'
      end,
      operational_trace = job.operational_trace || jsonb_build_array(
        jsonb_build_object(
          'at', now(),
          'step', case when next_job.was_stale then 'reclaimed_stale_job' else 'claimed' end,
          'message', case
            when next_job.was_stale then 'Stale processing job was reclaimed and restarted from the beginning.'
            else 'Job claimed from priority queue for processing.'
          end,
          'previous_status', next_job.previous_status,
          'previous_started_at', next_job.previous_started_at
        )
      )
    from next_job
    where job.id = next_job.id
    returning job.id, job.request_id, job.document_id
  )
  select
    claimed.id as job_id,
    claimed.request_id,
    claimed.document_id,
    document.storage_path,
    document.file_name,
    document.mime_type
  from claimed
  join public.request_documents document on document.id = claimed.document_id;
end;
$$;

revoke all on function public.claim_next_ai_review_job(integer) from public;
grant execute on function public.claim_next_ai_review_job(integer) to service_role;
