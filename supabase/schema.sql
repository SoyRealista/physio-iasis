-- Physio ΙΑΣΙΣ — esquema inicial
-- Ejecutar completo en el SQL Editor de Supabase (proyecto nuevo).
-- Modelo de seguridad: cualquier usuario autenticado (Supabase Auth) = personal de la clínica.
-- No hay registro público de usuarios: las cuentas de staff se crean a mano desde el
-- dashboard de Supabase (Authentication > Users > Invite). Las reservas públicas
-- (web y bot) NO usan estas policies: pasan por rutas de servidor con la service_role key,
-- que valida disponibilidad antes de escribir.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────
-- Tablas
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists clinic_settings (
  id smallint primary key default 1,
  clinic_name text not null default 'Physio ΙΑΣΙΣ',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  opening_hours_note_el text not null default '',
  opening_hours_note_en text not null default '',
  timezone text not null default 'Europe/Athens',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

create table if not exists therapists (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title_el text not null default '',
  title_en text not null default '',
  bio_el text not null default '',
  bio_en text not null default '',
  color text not null default '#1f7a6a',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name_el text not null,
  name_en text not null,
  description_el text not null default '',
  description_en text not null default '',
  duration_minutes int not null default 45,
  price numeric(10,2) not null default 0,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists therapist_availability (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references therapists(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = domingo … 6 = sábado
  start_time time not null,
  end_time time not null,
  constraint valid_range check (start_time < end_time)
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  birth_date date,
  medical_notes text,
  created_at timestamptz not null default now()
);
create index if not exists clients_email_idx on clients (email);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  therapist_id uuid not null references therapists(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','completed','cancelled','no_show')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','waived')),
  price numeric(10,2) not null default 0,
  source text not null default 'web' check (source in ('web','bot','admin')),
  notes text,
  created_at timestamptz not null default now(),
  constraint valid_appt_range check (start_at < end_at)
);
create index if not exists appointments_start_idx on appointments (start_at);
create index if not exists appointments_therapist_start_idx on appointments (therapist_id, start_at);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_logs_session_idx on chat_logs (session_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────

alter table clinic_settings enable row level security;
alter table therapists enable row level security;
alter table services enable row level security;
alter table therapist_availability enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table chat_logs enable row level security;
alter table contact_messages enable row level security;

-- Lectura pública de contenido no sensible (web pública, sin exponer datos de clientes)
create policy "public read clinic_settings" on clinic_settings for select to anon using (true);
create policy "public read active services" on services for select to anon using (active = true);
create policy "public read active therapists" on therapists for select to anon using (active = true);
create policy "public read availability" on therapist_availability for select to anon using (true);

-- Staff (cualquier usuario autenticado) — acceso completo
create policy "staff full clinic_settings" on clinic_settings for all to authenticated using (true) with check (true);
create policy "staff full therapists" on therapists for all to authenticated using (true) with check (true);
create policy "staff full services" on services for all to authenticated using (true) with check (true);
create policy "staff full availability" on therapist_availability for all to authenticated using (true) with check (true);
create policy "staff full clients" on clients for all to authenticated using (true) with check (true);
create policy "staff full appointments" on appointments for all to authenticated using (true) with check (true);
create policy "staff read chat_logs" on chat_logs for select to authenticated using (true);
create policy "staff full contact_messages" on contact_messages for all to authenticated using (true) with check (true);

-- clients / appointments / chat_logs / contact_messages NO tienen policy para anon:
-- las reservas públicas (web + bot) se escriben desde rutas de servidor con la
-- service_role key (bypassa RLS) tras validar disponibilidad.

-- ─────────────────────────────────────────────────────────────────────────
-- Datos iniciales (edítalos luego desde el panel /admin)
-- ─────────────────────────────────────────────────────────────────────────

insert into clinic_settings (id, clinic_name, address, phone, email, opening_hours_note_el, opening_hours_note_en, timezone)
values (
  1,
  'Physio ΙΑΣΙΣ',
  'Τσιμισκή 45, Θεσσαλονίκη 546 23',
  '+30 231 000 0000',
  'info@physioiasis.gr',
  'Δευτέρα–Παρασκευή 09:00–20:00, Σάββατο 10:00–14:00',
  'Mon–Fri 09:00–20:00, Sat 10:00–14:00',
  'Europe/Athens'
)
on conflict (id) do nothing;

insert into therapists (full_name, title_el, title_en, bio_el, bio_en, color)
values
  ('Γιάννης Παπαδόπουλος', 'Ιδρυτής & Φυσικοθεραπευτής', 'Founder & Physiotherapist',
   'Εξειδίκευση σε ορθοπεδική και αθλητική αποκατάσταση.', 'Specialised in orthopaedic and sports rehabilitation.', '#1f7a6a'),
  ('Ελένη Κωνσταντίνου', 'Φυσικοθεραπεύτρια', 'Physiotherapist',
   'Εξειδίκευση σε νευρολογική αποκατάσταση και μανουάλ θεραπεία.', 'Specialised in neurological rehab and manual therapy.', '#d9663c')
on conflict do nothing;

insert into services (name_el, name_en, description_el, description_en, duration_minutes, price, sort_order)
values
  ('Ορθοπεδική Φυσικοθεραπεία', 'Orthopaedic Physiotherapy',
   'Αποκατάσταση μετά από κακώσεις, χειρουργεία ή χρόνιο πόνο σε αρθρώσεις και μυοσκελετικό σύστημα.',
   'Recovery after injuries, surgery or chronic joint and musculoskeletal pain.', 45, 35, 1),
  ('Αθλητικές Κακώσεις', 'Sports Injury Rehab',
   'Εξειδικευμένη αποκατάσταση για αθλητές — από διάστρεμμα μέχρι επιστροφή στον αγωνιστικό χώρο.',
   'Specialised rehab for athletes — from sprains to a safe return to play.', 45, 35, 2),
  ('Θεραπεία Πλάτης & Αυχένα', 'Back & Neck Therapy',
   'Ανακούφιση από πόνο στη μέση και τον αυχένα με χειροθεραπεία και θεραπευτική άσκηση.',
   'Relief from lower back and neck pain through manual therapy and exercise.', 40, 30, 3),
  ('Νευρολογική Αποκατάσταση', 'Neurological Rehabilitation',
   'Πρόγραμμα αποκατάστασης για ασθενείς μετά από εγκεφαλικό ή νευρολογικές παθήσεις.',
   'Rehabilitation programmes for patients after stroke or neurological conditions.', 50, 40, 4),
  ('Μανουάλ Θεραπεία', 'Manual Therapy',
   'Τεχνικές κινητοποίησης αρθρώσεων και μαλακών μορίων για άμεση ανακούφιση.',
   'Joint mobilisation and soft-tissue techniques for immediate relief.', 30, 25, 5),
  ('Θεραπευτική Άσκηση', 'Therapeutic Exercise',
   'Εξατομικευμένα προγράμματα άσκησης για ενδυνάμωση και πρόληψη τραυματισμών.',
   'Personalised exercise programmes to strengthen and prevent injury.', 45, 30, 6)
on conflict do nothing;

-- Horario semanal por defecto para cada terapeuta: Lunes–Viernes 09:00–17:00
insert into therapist_availability (therapist_id, weekday, start_time, end_time)
select t.id, w.weekday, '09:00', '17:00'
from therapists t
cross join (select generate_series(1,5) as weekday) w
on conflict do nothing;
