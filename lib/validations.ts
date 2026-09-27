// lib/validations.ts
import { z } from 'zod';

export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().min(1, 'Breed is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  microchip_id: z.string().optional(),
});

export const healthRecordSchema = z.object({
  pet_id: z.coerce.number().positive('Pet ID is required'),
  record_type: z.enum(['vaccine', 'deworming', 'note']),
  date: z.string().min(1, 'Date is required'),
  vaccine_name: z.string().optional(),
  batch_lot_number: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.record_type === 'vaccine') {
    return !!data.vaccine_name && !!data.batch_lot_number;
  }
  return true;
}, {
  message: 'Vaccine name and batch/lot number are required for vaccination records',
  path: ['vaccine_name'],
});

export const appointmentBookingSchema = z.object({
  pet_id: z.coerce.number().positive('Please select a pet'),
  clinic_id: z.coerce.number().positive('Please select a clinic'),
  service_type: z.string().min(1, 'Please select a service'),
  date: z.string().min(1, 'Please select a date'),
  time_slot: z.string().min(1, 'Please select a time slot'),
});

export const scheduleSchema = z.object({
  day_of_week: z.string().min(1, 'Day of week is required'),
  open_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
  close_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
  max_slots_per_hour: z.coerce.number().int().min(1, 'Must be at least 1 slot per hour'),
});

export type PetFormValues = z.infer<typeof petSchema>;
export type HealthRecordFormValues = z.infer<typeof healthRecordSchema>;
export type AppointmentBookingFormValues = z.infer<typeof appointmentBookingSchema>;
export type ScheduleFormValues = z.infer<typeof scheduleSchema>;