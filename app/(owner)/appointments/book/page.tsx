// app/(owner)/appointments/book/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { Pet, Clinic } from '@/types';
import { appointmentBookingSchema, AppointmentBookingFormValues } from '@/lib/validations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [cityFilter, setCityFilter] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

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
  const selectedDate = form.watch('date');

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

  const { data: availableSlots, isLoading: slotsLoading } = useQuery<string[]>({
    queryKey: ['available-slots', selectedClinicId, selectedDate],
    queryFn: async () => {
      if (!selectedClinicId || !selectedDate) return [];
      const res = await api.get(`/clinics/${selectedClinicId}/available-slots`, {
        params: { date: selectedDate },
      });
      return res.data;
    },
    enabled: !!selectedClinicId && !!selectedDate,
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
          {/* Step 1: Pet Selection */}
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

          {/* Step 2: Clinic & Service Selection */}
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

          {/* Step 3: Date & Slot Capacity Allocation */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Pick Date & Reserved Slot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('time_slot', '');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedDate && (
                  <FormField
                    control={form.control}
                    name="time_slot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Hourly Time Slot</FormLabel>
                        {slotsLoading ? (
                          <p className="text-xs text-muted-foreground">Checking clinic slot capacity...</p>
                        ) : availableSlots && availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                type="button"
                                variant={field.value === slot ? 'default' : 'outline'}
                                className="text-xs"
                                onClick={() => field.onChange(slot)}
                              >
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {slot}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-destructive">No slots available for this date due to capacity limits.</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    {bookingMutation.isPending ? 'Confirming...' : 'Submit Booking'}
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