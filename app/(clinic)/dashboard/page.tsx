// app/(clinic)/dashboard/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, X, CheckCheck } from 'lucide-react';

export default function ClinicDashboard() {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['clinic-appointments'],
    queryFn: async () => {
      const res = await api.get('/clinic/appointments');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ appt_id, status }: { appt_id: number; status: AppointmentStatus }) => {
      return await api.patch(`/appointments/${appt_id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-appointments'] });
    },
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'Confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Cancelled</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointment Queue</h1>
          <p className="text-sm text-muted-foreground">Manage incoming reservations and queue capacity.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Appointments Stream</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading queue...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Pet ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments && appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <TableRow key={appt.appt_id}>
                      <TableCell className="font-mono text-xs">#{appt.appt_id}</TableCell>
                      <TableCell className="font-medium">Pet #{appt.pet_id}</TableCell>
                      <TableCell>{appt.service_type}</TableCell>
                      <TableCell className="text-sm font-mono">
                        {new Date(appt.date_time).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(appt.status)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {appt.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => updateStatusMutation.mutate({ appt_id: appt.appt_id, status: 'Confirmed' })}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => updateStatusMutation.mutate({ appt_id: appt.appt_id, status: 'Cancelled' })}
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {appt.status === 'Confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => updateStatusMutation.mutate({ appt_id: appt.appt_id, status: 'Completed' })}
                          >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Complete
                          </Button>
                        )}
                        {(appt.status === 'Completed' || appt.status === 'Cancelled') && (
                          <span className="text-xs text-muted-foreground italic">Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">
                      No appointments booked.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}