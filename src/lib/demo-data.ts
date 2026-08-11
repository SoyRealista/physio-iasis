import type { ClinicSettings, Service, Therapist } from "./types";

/**
 * Contenido de respaldo — se muestra si Supabase no está configurado todavía
 * (o falla la consulta) para que el sitio siempre sea visitable.
 * Coincide con los INSERT de seed en supabase/schema.sql: al conectar la
 * base de datos real, este contenido se sustituye automáticamente.
 */

export const DEMO_SERVICES: Service[] = [
  {
    id: "demo-1",
    name_el: "Ορθοπεδική Φυσικοθεραπεία",
    name_en: "Orthopaedic Physiotherapy",
    description_el:
      "Αποκατάσταση μετά από κακώσεις, χειρουργεία ή χρόνιο πόνο σε αρθρώσεις και μυοσκελετικό σύστημα.",
    description_en:
      "Recovery after injuries, surgery or chronic joint and musculoskeletal pain.",
    duration_minutes: 45,
    price: 35,
    active: true,
    sort_order: 1,
  },
  {
    id: "demo-2",
    name_el: "Αθλητικές Κακώσεις",
    name_en: "Sports Injury Rehab",
    description_el:
      "Εξειδικευμένη αποκατάσταση για αθλητές — από διάστρεμμα μέχρι επιστροφή στον αγωνιστικό χώρο.",
    description_en:
      "Specialised rehab for athletes — from sprains to a safe return to play.",
    duration_minutes: 45,
    price: 35,
    active: true,
    sort_order: 2,
  },
  {
    id: "demo-3",
    name_el: "Θεραπεία Πλάτης & Αυχένα",
    name_en: "Back & Neck Therapy",
    description_el:
      "Ανακούφιση από πόνο στη μέση και τον αυχένα με χειροθεραπεία και θεραπευτική άσκηση.",
    description_en:
      "Relief from lower back and neck pain through manual therapy and exercise.",
    duration_minutes: 40,
    price: 30,
    active: true,
    sort_order: 3,
  },
  {
    id: "demo-4",
    name_el: "Νευρολογική Αποκατάσταση",
    name_en: "Neurological Rehabilitation",
    description_el:
      "Πρόγραμμα αποκατάστασης για ασθενείς μετά από εγκεφαλικό ή νευρολογικές παθήσεις.",
    description_en:
      "Rehabilitation programmes for patients after stroke or neurological conditions.",
    duration_minutes: 50,
    price: 40,
    active: true,
    sort_order: 4,
  },
  {
    id: "demo-5",
    name_el: "Μανουάλ Θεραπεία",
    name_en: "Manual Therapy",
    description_el: "Τεχνικές κινητοποίησης αρθρώσεων και μαλακών μορίων για άμεση ανακούφιση.",
    description_en: "Joint mobilisation and soft-tissue techniques for immediate relief.",
    duration_minutes: 30,
    price: 25,
    active: true,
    sort_order: 5,
  },
  {
    id: "demo-6",
    name_el: "Θεραπευτική Άσκηση",
    name_en: "Therapeutic Exercise",
    description_el: "Εξατομικευμένα προγράμματα άσκησης για ενδυνάμωση και πρόληψη τραυματισμών.",
    description_en: "Personalised exercise programmes to strengthen and prevent injury.",
    duration_minutes: 45,
    price: 30,
    active: true,
    sort_order: 6,
  },
];

export const DEMO_THERAPISTS: Therapist[] = [
  {
    id: "demo-t1",
    full_name: "Γιάννης Παπαδόπουλος",
    title_el: "Ιδρυτής & Φυσικοθεραπευτής",
    title_en: "Founder & Physiotherapist",
    bio_el: "Εξειδίκευση σε ορθοπεδική και αθλητική αποκατάσταση.",
    bio_en: "Specialised in orthopaedic and sports rehabilitation.",
    color: "#1f7a6a",
    active: true,
  },
  {
    id: "demo-t2",
    full_name: "Ελένη Κωνσταντίνου",
    title_el: "Φυσικοθεραπεύτρια",
    title_en: "Physiotherapist",
    bio_el: "Εξειδίκευση σε νευρολογική αποκατάσταση και μανουάλ θεραπεία.",
    bio_en: "Specialised in neurological rehab and manual therapy.",
    color: "#d9663c",
    active: true,
  },
];

export const DEMO_SETTINGS: ClinicSettings = {
  id: 1,
  clinic_name: "Physio ΙΑΣΙΣ",
  address: "Τσιμισκή 45, Θεσσαλονίκη 546 23",
  phone: "+30 231 000 0000",
  email: "info@physioiasis.gr",
  opening_hours_note_el: "Δευτέρα–Παρασκευή 09:00–20:00, Σάββατο 10:00–14:00",
  opening_hours_note_en: "Mon–Fri 09:00–20:00, Sat 10:00–14:00",
  timezone: "Europe/Athens",
};

export const IS_DEMO_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
