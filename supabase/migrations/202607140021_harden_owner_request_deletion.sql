-- Allow Owner request deletion even if Storage cleanup is unavailable.
-- Orphaned private objects remain inaccessible and can be cleaned separately.

create or replace function public.delete_request_as_owner(p_request_id text)
returns void
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_storage_paths text[];
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role_id = 'owner'
  ) then
    raise exception 'Only the Owner can delete a request.';
  end if;

  select array_agg(storage_path)
  into v_storage_paths
  from public.request_documents
  where request_id = p_request_id and storage_path is not null;

  delete from public.legal_requests where id = p_request_id;
  if not found then
    raise exception 'Request not found.';
  end if;

  begin
    if coalesce(array_length(v_storage_paths, 1), 0) > 0 then
      delete from storage.objects
      where bucket_id = 'legal-documents' and name = any(v_storage_paths);
    end if;
  exception when others then
    -- The request is already deleted. Storage cleanup must never block this action.
    null;
  end;
end;
$$;

grant execute on function public.delete_request_as_owner(text) to authenticated;
