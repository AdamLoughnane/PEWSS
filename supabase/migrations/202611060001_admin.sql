-- Apply only to the dedicated PEWSS Supabase project. No public data access.
create table public.pewss_applications (
  id uuid primary key,
  reference text unique not null,
  name text not null,
  email text not null,
  institution text not null default '',
  career_stage text not null,
  country text not null,
  responses jsonb not null,
  -- Private photo, stored atomically with the application, never a public URL.
  photo jsonb,
  payload_hash text not null,
  created_at timestamptz not null default now(),
  notification_sent boolean not null default false,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  source text not null default 'form' check (source in ('form','email_import'))
);
create index pewss_applications_created on public.pewss_applications (created_at desc, id);
create table public.pewss_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique not null references public.pewss_applications(id),
  outcome text not null check (outcome in ('accepted','rejected')),
  recipient text not null,
  sender text not null,
  subject text not null,
  body text not null,
  actor uuid not null,
  state text not null default 'sending' check (state in ('sending','uncertain','sent')),
  lease_id uuid not null,
  lease_until timestamptz not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text
);
create table public.pewss_auth_limits (
  key text primary key,
  window_start timestamptz not null,
  hits int not null
);
alter table public.pewss_applications enable row level security;
alter table public.pewss_decisions enable row level security;
alter table public.pewss_auth_limits enable row level security;
revoke all on public.pewss_applications, public.pewss_decisions, public.pewss_auth_limits from anon, authenticated;
grant all on public.pewss_applications, public.pewss_decisions, public.pewss_auth_limits to service_role;

create function public.pewss_auth_limit(p_key text, p_seconds int, p_max int) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare n int;
begin
  delete from public.pewss_auth_limits where window_start < now() - interval '1 day';
  insert into public.pewss_auth_limits values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when pewss_auth_limits.window_start < now() - make_interval(secs => p_seconds) then 1 else pewss_auth_limits.hits + 1 end,
    window_start = case when pewss_auth_limits.window_start < now() - make_interval(secs => p_seconds) then now() else pewss_auth_limits.window_start end
  returning hits into n;
  return n <= p_max;
end $$;

-- Lock one application before claiming a decision, preventing concurrent or contradictory sends.
create function public.pewss_claim_decision(p_application uuid, p_outcome text, p_subject text, p_body text, p_sender text, p_actor uuid, p_lease uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare a public.pewss_applications; d public.pewss_decisions;
begin
  select * into a from public.pewss_applications where id = p_application for update;
  if not found then return jsonb_build_object('result','missing'); end if;
  select * into d from public.pewss_decisions where application_id = p_application for update;
  if found then
    if d.state = 'sent' then return jsonb_build_object('result','sent','decision',to_jsonb(d)); end if;
    if d.created_at < now() - interval '23 hours' then return jsonb_build_object('result','expired'); end if;
    if d.lease_until > now() then return jsonb_build_object('result','busy'); end if;
    if d.outcome <> p_outcome or d.subject <> p_subject or d.body <> p_body then return jsonb_build_object('result','immutable'); end if;
    update public.pewss_decisions set state='sending', lease_id=p_lease, lease_until=now()+interval '60 seconds' where id=d.id returning * into d;
  else
    insert into public.pewss_decisions(application_id,outcome,recipient,sender,subject,body,actor,lease_id,lease_until)
    values(a.id,p_outcome,a.email,p_sender,p_subject,p_body,p_actor,p_lease,now()+interval '60 seconds') returning * into d;
  end if;
  return jsonb_build_object('result','claimed','decision',to_jsonb(d));
end $$;

create function public.pewss_finish_decision(p_decision uuid, p_lease uuid, p_provider text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare d public.pewss_decisions;
begin
  update public.pewss_decisions set state='sent', provider_id=p_provider, sent_at=now(), lease_until=now()
  where id=p_decision and lease_id=p_lease returning * into d;
  if not found then return false; end if;
  update public.pewss_applications set status=d.outcome where id=d.application_id;
  return true;
end $$;
revoke all on function public.pewss_auth_limit(text,int,int) from public, anon, authenticated;
revoke all on function public.pewss_claim_decision(uuid,text,text,text,text,uuid,uuid) from public, anon, authenticated;
revoke all on function public.pewss_finish_decision(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.pewss_auth_limit(text,int,int) to service_role;
grant execute on function public.pewss_claim_decision(uuid,text,text,text,text,uuid,uuid) to service_role;
grant execute on function public.pewss_finish_decision(uuid,uuid,text) to service_role;
