-- Passkeys for the organiser's administrator login (Better Auth passkey plugin 1.7.25).
-- Run once as the database owner. Passkeys can only belong to the single allowed user,
-- because "userId" references pewss_auth_user, which a constraint limits to the organiser.
create table "pewss_auth_passkey" ("id" text not null primary key, "name" text, "publicKey" text not null, "userId" text not null references "pewss_auth_user" ("id") on delete cascade, "credentialID" text not null, "counter" integer not null, "deviceType" text not null, "backedUp" boolean not null, "transports" text, "createdAt" timestamptz, "aaguid" text);

create index "pewss_auth_passkey_userId_idx" on "pewss_auth_passkey" ("userId");

create unique index "pewss_auth_passkey_credentialID_idx" on "pewss_auth_passkey" ("credentialID");

-- Same access rules as the other login tables: only the server's restricted role.
revoke all on table public.pewss_auth_passkey from public;
grant select,insert,update,delete on table public.pewss_auth_passkey to pewss_app;
alter table public.pewss_auth_passkey enable row level security;
create policy pewss_server on public.pewss_auth_passkey to pewss_app using(true) with check(true);
