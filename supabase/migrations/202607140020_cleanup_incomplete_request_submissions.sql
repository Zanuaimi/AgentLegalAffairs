-- Remove a request created before its PDF upload failed, preventing orphaned pending rows.

create or replace function public.delete_own_incomplete_request(p_request_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.legal_requests request
  where request.id = p_request_id
    and request.requester_id = auth.uid()
    and not exists (
      select 1 from public.request_documents document
      where document.request_id = request.id
    );
end;
$$;

grant execute on function public.delete_own_incomplete_request(text) to authenticated;
