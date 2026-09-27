'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, X } from 'lucide-react';

export default function MyAppointmentsPage() {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (appt_id: number) => {
      return await api.patch(`/appointments/${appt_id}/status`, {
        status: 'Cancelled',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending Confirmation
          </Badge>
        );
      case 'Confirmed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Confirmed
          </Badge>
        );
      case 'Completed':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Completed
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Cancelled
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Track real-time appointment status and booking history.
          </p>
        </div>
        <Link href="/appointments/book">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Book Visit
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading appointments...
        </div>
      ) : appointments && appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const dateObj = new Date(appt.date_time);
            return (
              <Card key={appt.appt_id}>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      {appt.service_type}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Pet ID: #{appt.pet_id} • Clinic ID: #{appt.clinic_id}
                    </p>
                  </div>
                  {getStatusBadge(appt.status)}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{dateObj.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {dateObj.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {appt.status === 'Pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => cancelMutation.mutate(appt.appt_id)}
                        disabled={cancelMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-3">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">No appointments found</p>
              <p className="text-xs text-muted-foreground">
                You do not have any scheduled or past clinical visits.
              </p>
            </div>
            <Link href="/appointments/book">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Book Your First Visit
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
