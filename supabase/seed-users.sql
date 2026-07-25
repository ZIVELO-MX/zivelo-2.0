-- Local/CI identities for NextAuth sign-in verification.
insert into public.users (name, username, email, "avatarUrl", role) values
  ('Benjamín Rodríguez', 'benrod', 'benjamin.rodriguez@zivelo.dev', '', 'admin'),
  ('Raúl Méndez', 'rulaxx', 'raul.mendez@zivelo.dev', '', 'admin')
on conflict (email) do nothing;
