-- Allow authenticated users to write safe Legal Affair Engine terminal events.
-- This is needed for requester-side queue trigger failures that happen before
-- the Edge Function can record an event itself.

drop policy if exists "authenticated create ai engine events" on public.ai_engine_events;
create policy "authenticated create ai engine events" on public.ai_engine_events
for insert to authenticated with check (true);
