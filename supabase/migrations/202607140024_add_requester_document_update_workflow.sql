-- Let a requester update supporting PDFs after a reviewer requests more information.
-- The database repeats the UI rule: an updated request must retain at least one PDF.

create or replace function public.finalize_requester_document_update(
  p_request_id text,
  p_remove_document_ids uuid[],
  p_new_document_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_remaining_document_count integer;
  v_storage_paths text[];
begin
  if not exists (
    select 1 from public.legal_requests
    where id = p_request_id
      and requester_id = auth.uid()
      and status = 'Waiting for More Information'
  ) then
    raise exception 'You can update documents only for your request after more information has been requested.';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_new_document_ids, array[]::uuid[])) as new_document_id
    where not exists (
      select 1 from public.request_documents
      where id = new_document_id and request_id = p_request_id
    )
  ) then
    raise exception 'One or more uploaded documents do not belong to this request.';
  end if;

  select count(*) into v_remaining_document_count
  from public.request_documents
  where request_id = p_request_id
    and id <> all(coalesce(p_remove_document_ids, array[]::uuid[]));

  if v_remaining_document_count < 1 then
    raise exception 'Keep at least one PDF attachment or upload a replacement before resubmitting.';
  end if;

  select array_agg(storage_path) into v_storage_paths
  from public.request_documents
  where request_id = p_request_id
    and id = any(coalesce(p_remove_document_ids, array[]::uuid[]))
    and storage_path is not null;

  update public.legal_requests request
  set previous_document_id = (
        select id from public.request_documents
        where request_id = p_request_id and is_current
        order by created_at desc limit 1
      ),
      previous_ai_summary = request.ai_summary,
      previous_ai_review_result = request.ai_review_result,
      ai_summary = null,
      ai_review_result = null,
      status = 'AI Review Pending'
  where request.id = p_request_id;

  delete from public.request_documents
  where request_id = p_request_id
    and id = any(coalesce(p_remove_document_ids, array[]::uuid[]));

  if coalesce(array_length(p_new_document_ids, 1), 0) > 0 then
    update public.request_documents
    set is_current = id = any(p_new_document_ids)
    where request_id = p_request_id;

    insert into public.ai_review_jobs (
      request_id, document_id, status, queue_order, current_step, operational_trace
    )
    select
      p_request_id,
      new_document_id,
      'queued',
      extract(epoch from now()) * 1000 + row_number() over (),
      'Queued after requester document update',
      jsonb_build_array(jsonb_build_object(
        'at', now(),
        'step', 'queued',
        'message', 'Requester updated supporting PDFs. AI review is waiting in the priority queue.'
      ))
    from unnest(p_new_document_ids) as new_document_id
    on conflict (request_id, document_id) do update set
      status = 'queued', last_error = null, locked_at = null, started_at = null,
      completed_at = null, current_step = excluded.current_step,
      operational_trace = excluded.operational_trace;
  end if;

  begin
    if coalesce(array_length(v_storage_paths, 1), 0) > 0 then
      delete from storage.objects
      where bucket_id = 'legal-documents' and name = any(v_storage_paths);
    end if;
  exception when others then
    -- Removed request documents must not be restored if Storage object cleanup fails.
    null;
  end;
end;
$$;

grant execute on function public.finalize_requester_document_update(text, uuid[], uuid[]) to authenticated;
