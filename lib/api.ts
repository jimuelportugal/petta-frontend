// lib/api.ts
import { Pet, HealthRecord, Clinic, Schedule, Appointment } from '@/types';

const INITIAL_CLINICS: Clinic[] = [
  {
    clinic_id: 1,
    clinic_name: 'Metro Vets Animal Hospital',
    location: 'Naga City',
    contact_info: '+63 917 123 4567',
    services_offered: 'Checkup, Vaccine, Deworming, Surgery',
    verified: true,
  },
  {
    clinic_id: 2,
    clinic_name: 'St. Francis Pet Care Clinic',
    location: 'Canaman',
    contact_info: '+63 920 987 6543',
    services_offered: 'Checkup, Vaccine, Grooming',
    verified: true,
  },
];

const INITIAL_PETS: Pet[] = [
  {
    pet_id: 101,
    owner_id: 1,
    name: 'Milo',
    species: 'Canine',
    breed: 'Golden Retriever',
    date_of_birth: '2023-04-15',
    microchip_id: '985141001234567',
  },
  {
    pet_id: 102,
    owner_id: 1,
    name: 'Luna',
    species: 'Feline',
    breed: 'Siamese',
    date_of_birth: '2024-01-20',
  },
];

const INITIAL_RECORDS: HealthRecord[] = [
  {
    record_id: 1,
    pet_id: 101,
    vet_id: 1,
    record_type: 'vaccine',
    date: '2026-03-10',
    vaccine_name: 'Rabies (Rabisin)',
    batch_lot_number: 'LOT-99824X',
    notes: 'Routine 1-year booster administered subcutaneously.',
  },
  {
    record_id: 2,
    pet_id: 101,
    vet_id: 1,
    record_type: 'deworming',
    date: '2026-05-12',
    batch_lot_number: 'DWM-2026-A',
    notes: 'Broad spectrum deworming administered.',
  },
];

const INITIAL_SCHEDULES: Schedule[] = [
  {
    schedule_id: 1,
    clinic_id: 1,
    day_of_week: 'Monday',
    open_time: '09:00',
    close_time: '17:00',
    max_slots_per_hour: 4,
  },
  {
    schedule_id: 2,
    clinic_id: 1,
    day_of_week: 'Wednesday',
    open_time: '09:00',
    close_time: '17:00',
    max_slots_per_hour: 4,
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    appt_id: 501,
    pet_id: 101,
    clinic_id: 1,
    service_type: 'Vaccine',
    date_time: '2026-09-25T10:00:00',
    status: 'Pending',
  },
];

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(`petta_${key}`);
  if (!stored) {
    localStorage.setItem(`petta_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`petta_${key}`, JSON.stringify(data));
  }
}

export const api = {
  async get(url: string, config?: { params?: any }) {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (url === '/pets') {
      return { data: getStorage<Pet[]>('pets', INITIAL_PETS) };
    }

    if (url.startsWith('/pets/') && url.endsWith('/records')) {
      const match = url.match(/\/pets\/(\d+)\/records/);
      const petId = match ? Number(match[1]) : 0;
      const all = getStorage<HealthRecord[]>('records', INITIAL_RECORDS);
      return { data: all.filter((r) => r.pet_id === petId) };
    }

    if (url.startsWith('/pets/')) {
      const petId = Number(url.replace('/pets/', ''));
      const pets = getStorage<Pet[]>('pets', INITIAL_PETS);
      const pet = pets.find((p) => p.pet_id === petId);
      return { data: pet || null };
    }

    if (url === '/clinics' || url === '/admin/clinics') {
      return { data: getStorage<Clinic[]>('clinics', INITIAL_CLINICS) };
    }

    if (url.includes('/available-slots')) {
      return {
        data: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      };
    }

    if (url === '/appointments' || url === '/clinic/appointments') {
      return { data: getStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS) };
    }

    if (url === '/clinic/schedules') {
      return { data: getStorage<Schedule[]>('schedules', INITIAL_SCHEDULES) };
    }

    return { data: [] };
  },

  async post(url: string, body: any) {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (url === '/pets') {
      const pets = getStorage<Pet[]>('pets', INITIAL_PETS);
      const newPet: Pet = {
        pet_id: Date.now(),
        owner_id: 1,
        name: body.name,
        species: body.species,
        breed: body.breed,
        date_of_birth: body.date_of_birth,
        microchip_id: body.microchip_id || undefined,
      };
      pets.unshift(newPet);
      setStorage('pets', pets);
      return { data: newPet };
    }

    if (url.includes('/records')) {
      const records = getStorage<HealthRecord[]>('records', INITIAL_RECORDS);
      const newRecord: HealthRecord = {
        record_id: Date.now(),
        pet_id: Number(body.pet_id),
        vet_id: 1,
        record_type: body.record_type,
        date: body.date,
        vaccine_name: body.vaccine_name,
        batch_lot_number: body.batch_lot_number,
        notes: body.notes,
      };
      records.unshift(newRecord);
      setStorage('records', records);
      return { data: newRecord };
    }

    if (url === '/appointments') {
      const appts = getStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
      const newAppt: Appointment = {
        appt_id: Date.now(),
        pet_id: Number(body.pet_id),
        clinic_id: Number(body.clinic_id),
        service_type: body.service_type,
        date_time: body.date_time,
        status: 'Pending',
      };
      appts.unshift(newAppt);
      setStorage('appointments', appts);
      return { data: newAppt };
    }

    if (url === '/clinic/schedules') {
      const schedules = getStorage<Schedule[]>('schedules', INITIAL_SCHEDULES);
      const newSchedule: Schedule = {
        schedule_id: Date.now(),
        clinic_id: 1,
        day_of_week: body.day_of_week,
        open_time: body.open_time,
        close_time: body.close_time,
        max_slots_per_hour: Number(body.max_slots_per_hour),
      };
      schedules.push(newSchedule);
      setStorage('schedules', schedules);
      return { data: newSchedule };
    }

    if (url === '/auth/register' || url === '/auth/login') {
      return {
        data: {
          token: 'mock-jwt-token-12345',
          user: {
            user_id: 1,
            full_name: body.full_name || 'Test User',
            email: body.email,
            role: body.role || 'owner',
            created_at: new Date().toISOString(),
          },
        },
      };
    }

    return { data: { success: true } };
  },

  async patch(url: string, body: any) {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (url.includes('/appointments/') && url.endsWith('/status')) {
      const match = url.match(/\/appointments\/(\d+)\/status/);
      const apptId = match ? Number(match[1]) : 0;
      const appts = getStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
      const updated = appts.map((a) =>
        a.appt_id === apptId ? { ...a, status: body.status } : a
      );
      setStorage('appointments', updated);
      return { data: { success: true } };
    }

    if (url.includes('/admin/clinics/') && url.endsWith('/verify')) {
      const match = url.match(/\/admin\/clinics\/(\d+)\/verify/);
      const clinicId = match ? Number(match[1]) : 0;
      const clinics = getStorage<Clinic[]>('clinics', INITIAL_CLINICS);
      const updated = clinics.map((c) =>
        c.clinic_id === clinicId ? { ...c, verified: body.verified } : c
      );
      setStorage('clinics', updated);
      return { data: { success: true } };
    }

    return { data: { success: true } };
  },
};