-- The only application login is the organiser's pre-existing identity.
alter table public.pewss_auth_user add constraint pewss_only_administrator
  check (id='08e4779b-748b-43f3-b83e-9c1df4ef2b5a' and email='adam.loughnane@ucc.ie');
insert into public.pewss_auth_user(id,name,email,"emailVerified")
values('08e4779b-748b-43f3-b83e-9c1df4ef2b5a','Adam Loughnane','adam.loughnane@ucc.ie',false);

revoke create on schema public from public;
revoke all on all tables in schema public from public;
revoke all on all functions in schema public from public;
grant usage on schema public to pewss_app;
grant select,insert,update,delete on all tables in schema public to pewss_app;
grant execute on function public.pewss_auth_limit(text,int,int) to pewss_app;
grant execute on function public.pewss_claim_decision(uuid,text,text,text,text,uuid,uuid) to pewss_app;
grant execute on function public.pewss_finish_decision(uuid,uuid,text) to pewss_app;
-- No browser credentials or public data API: only the server's limited role can access rows.
do $$
declare t text;
begin
  foreach t in array array['pewss_applications','pewss_decisions','pewss_auth_limits',
    'pewss_auth_user','pewss_auth_session','pewss_auth_account','pewss_auth_verification'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('create policy pewss_server on public.%I to pewss_app using(true) with check(true)',t);
  end loop;
end $$;
