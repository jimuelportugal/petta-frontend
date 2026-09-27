// types/index.ts
export type UserRole = 'owner' | 'vet' | 'admin';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type RecordType = 'vaccine' | 'deworming' | 'note';

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Pet {
  pet_id: number;
  owner_id: number;
  name: string;
  species: string;
  breed: string;
  date_of_birth: string;
  microchip_id?: string;
}

export interface HealthRecord {
  record_id: number;
  pet_id: number;
  vet_id: number;
  record_type: RecordType;
  date: string;
  vaccine_name?: string;
  batch_lot_number?: string;
  notes?: string;
}

export interface Clinic {
  clinic_id: number;
  clinic_name: string;
  location: string;
  contact_info: string;
  services_offered: string;
  verified: boolean;
}

export interface Schedule {
  schedule_id: number;
  clinic_id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  max_slots_per_hour: number;
}

export interface Appointment {
  appt_id: number;
  pet_id: number;
  clinic_id: number;
  vet_id?: number;
  service_type: string;
  date_time: string;
  status: AppointmentStatus;
}