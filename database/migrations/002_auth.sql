-- Better Auth 1.7.25 generated schema; PEWSS-only database.
create table "pewss_auth_user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "pewss_auth_session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "pewss_auth_user" ("id") on delete cascade);

create table "pewss_auth_account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "pewss_auth_user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table "pewss_auth_verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create index "pewss_auth_session_userId_idx" on "pewss_auth_session" ("userId");

create index "pewss_auth_account_userId_idx" on "pewss_auth_account" ("userId");

create index "pewss_auth_verification_identifier_idx" on "pewss_auth_verification" ("identifier");
