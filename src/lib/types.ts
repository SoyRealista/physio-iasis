export interface Service {
  id: string;
  name_el: string;
  name_en: string;
  description_el: string;
  description_en: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  sort_order: number;
}

export interface Therapist {
  id: string;
  full_name: string;
  title_el: string;
  title_en: string;
  bio_el: string;
  bio_en: string;
  color: string;
  active: boolean;
}

export interface TherapistAvailability {
  id: string;
  therapist_id: string;
  weekday: number; // 0 = Sunday .. 6 = Saturday
  start_time: string; // "09:00"
  end_time: string; // "17:00"
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus = "unpaid" | "paid" | "waived";

export interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  medical_notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  therapist_id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  price: number;
  source: "web" | "bot" | "admin";
  notes: string | null;
  created_at: string;
}

export interface ClinicSettings {
  id: number;
  clinic_name: string;
  address: string;
  phone: string;
  email: string;
  opening_hours_note_el: string;
  opening_hours_note_en: string;
  timezone: string;
}
