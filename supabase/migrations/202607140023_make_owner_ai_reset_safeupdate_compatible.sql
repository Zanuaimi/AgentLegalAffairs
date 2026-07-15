-- Supabase safe-update environments reject DELETE without a WHERE clause.

create or replace function public.owner_reset_ai_results()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role_id = 'owner') then
    raise exception 'Only the Owner can reset AI review results.';
  end if;

  delete from public.document_ai_suggestions where id is not null;
  delete from public.request_checklist_items where id is not null;
  delete from public.ai_review_jobs where id is not null;

  update public.legal_requests
  set ai_summary = null,
      ai_review_result = null,
      previous_ai_summary = null,
      previous_ai_review_result = null,
      status = case
        when status not in ('Closed', 'Archived', 'Approved') and exists (
          select 1 from public.request_documents d
          where d.request_id = legal_requests.id and d.storage_path is not null
        ) then 'AI Review Pending'
        else status
      end
  where id is not null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.owner_reset_ai_results() to authenticated;
