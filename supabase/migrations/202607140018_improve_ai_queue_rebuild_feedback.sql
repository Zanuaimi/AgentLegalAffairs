-- Rebuild all processable pending/failed AI reviews and explain when uploads are missing.

create or replace function public.rebuild_ai_review_queue()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer; v_missing_pdf_count integer;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role_id in ('admin_user', 'owner')) then
    raise exception 'Only an Admin User or Owner can rebuild the AI review queue.';
  end if;

  select count(*) into v_missing_pdf_count
  from public.legal_requests lr
  where lr.status in ('AI Review Pending', 'AI Review Failed')
    and not exists (
      select 1 from public.request_documents d
      where d.request_id = lr.id and d.storage_path is not null
    );

  with candidates as (
    select lr.id as request_id, d.id as document_id,
      row_number() over (order by case lr.priority when 'Urgent' then 1 when 'High' then 2 when 'Medium' then 3 else 4 end, lr.submitted_at) as queue_position
    from public.legal_requests lr
    join lateral (
      select id from public.request_documents
      where request_id = lr.id and storage_path is not null
      order by created_at asc limit 1
    ) d on true
    where lr.status in ('AI Review Pending', 'AI Review Failed')
       or (lr.ai_review_result is null and lr.status not in ('Closed', 'Archived', 'Approved'))
  ), queued as (
    insert into public.ai_review_jobs (request_id, document_id, status, queue_order, current_step, operational_trace)
    select request_id, document_id, 'queued', queue_position, 'Queue rebuilt by administrator', jsonb_build_array(jsonb_build_object('at', now(), 'step', 'queued', 'message', 'Queue rebuilt by administrator.'))
    from candidates
    on conflict (request_id, document_id) do update set
      status = 'queued', queue_order = excluded.queue_order, last_error = null,
      locked_at = null, started_at = null, completed_at = null,
      current_step = excluded.current_step, operational_trace = excluded.operational_trace
    returning request_id
  ) select count(*) into v_count from queued;

  if v_count = 0 and v_missing_pdf_count > 0 then
    raise exception '% pending AI request(s) have no private Storage PDF. Re-upload their PDF before queue processing can begin.', v_missing_pdf_count;
  end if;

  return v_count;
end;
$$;

grant execute on function public.rebuild_ai_review_queue() to authenticated;
