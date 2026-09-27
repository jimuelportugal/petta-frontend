'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { Pet, Clinic } from '@/types';
import { appointmentBookingSchema, AppointmentBookingFormValues } from '@/lib/validations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePickerTime, ClinicSlotItem } from '@/components/date-picker-time';
import { Search } from 'lucide-react';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [cityFilter, setCityFilter] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(undefined);

  const form = useForm<AppointmentBookingFormValues>({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: {
      pet_id: 0,
      clinic_id: 0,
      service_type: '',
      date: '',
      time_slot: '',
    },
  });

  const selectedClinicId = form.watch('clinic_id');
  const selectedDateStr = form.watch('date');

  const { data: pets } = useQuery<Pet[]>({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const res = await api.get('/pets');
      return res.data;
    },
  });

  const { data: clinics } = useQuery<Clinic[]>({
    queryKey: ['clinics'],
    queryFn: async () => {
      const res = await api.get('/clinics');
      return res.data;
    },
  });

  // Query clinic schedules and existing appointments to determine available vs taken slots
  const { data: slotList = [], isLoading: slotsLoading } = useQuery<ClinicSlotItem[]>({
    queryKey: ['clinic-slots', selectedClinicId, selectedDateStr],
    queryFn: async () => {
      if (!selectedClinicId || !selectedDateStr) return [];
      const res = await api.get(`/clinics/${selectedClinicId}/available-slots`, {
        params: { date: selectedDateStr },
      });
      // Accepts raw slots (e.g. [{ slot: "09:00", available: true }]) or strings (["09:00"])
      if (Array.isArray(res.data) && typeof res.data[0] === 'string') {
        return res.data.map((s: string) => ({ slot: s, available: true }));
      }
      return res.data;
    },
    enabled: !!selectedClinicId && !!selectedDateStr,
  });

  const bookingMutation = useMutation({
    mutationFn: async (values: AppointmentBookingFormValues) => {
      const payload = {
        pet_id: values.pet_id,
        clinic_id: values.clinic_id,
        service_type: values.service_type,
        date_time: `${values.date}T${values.time_slot}:00`,
        status: 'Pending',
      };
      return await api.post('/appointments', payload);
    },
    onSuccess: () => {
      router.push('/appointments');
    },
  });

  const filteredClinics = clinics?.filter((c) =>
    c.verified &&
    (c.location.toLowerCase().includes(cityFilter.toLowerCase()) ||
     c.clinic_name.toLowerCase().includes(cityFilter.toLowerCase()))
  ) || [];

  const selectedClinic = clinics?.find((c) => c.clinic_id === Number(selectedClinicId));
  const availableServices = selectedClinic ? selectedClinic.services_offered.split(',').map((s) => s.trim()) : [];

  const onSubmit = (values: AppointmentBookingFormValues) => {
    bookingMutation.mutate(values);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Book Veterinary Appointment</h1>
        <p className="text-sm text-muted-foreground">In-person payment upon visit completion.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Select Your Pet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pet_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        defaultValue={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a registered pet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pets?.map((pet) => (
                            <SelectItem key={pet.pet_id} value={String(pet.pet_id)}>
                              {pet.name} ({pet.species} - {pet.breed})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  className="w-full"
                  disabled={!form.watch('pet_id')}
                  onClick={() => setStep(2)}
                >
                  Continue to Clinic Selection
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Choose Clinic & Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter clinics by name or city..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clinic_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participating Clinic</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(Number(val));
                          form.setValue('service_type', '');
                          form.setValue('date', '');
                          form.setValue('time_slot', '');
                          setSelectedDateObj(undefined);
                        }}
                        defaultValue={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified clinic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredClinics.map((c) => (
                            <SelectItem key={c.clinic_id} value={String(c.clinic_id)}>
                              {c.clinic_name} ({c.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedClinic && (
                  <FormField
                    control={form.control}
                    name="service_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select procedure" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableServices.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="w-1/2" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="w-1/2"
                    disabled={!form.watch('clinic_id') || !form.watch('service_type')}
                    onClick={() => setStep(3)}
                  >
                    Select Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DatePickerTime
                  selectedDate={selectedDateObj}
                  onDateChange={(d) => {
                    setSelectedDateObj(d);
                    form.setValue('date', d ? format(d, 'yyyy-MM-dd') : '');
                    form.setValue('time_slot', '');
                  }}
                  selectedTime={form.watch('time_slot')}
                  onTimeChange={(t) => form.setValue('time_slot', t)}
                  slots={slotList}
                  isLoadingSlots={slotsLoading}
                />

                {form.formState.errors.date && (
                  <p className="text-xs text-destructive text-center">
                    {form.formState.errors.date.message}
                  </p>
                )}
                {form.formState.errors.time_slot && (
                  <p className="text-xs text-destructive text-center">
                    {form.formState.errors.time_slot.message}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="w-1/2" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-1/2"
                    disabled={bookingMutation.isPending || !form.watch('time_slot')}
                  >
                    {bookingMutation.isPending ? 'Confirming...' : 'Confirm Appointment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
