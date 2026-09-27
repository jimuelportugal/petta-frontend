// app/(admin)/clinics/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Clinic } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function AdminClinicsVerificationPage() {
  const queryClient = useQueryClient();

  const { data: clinics, isLoading } = useQuery<Clinic[]>({
    queryKey: ['admin-clinics'],
    queryFn: async () => {
      const res = await api.get('/admin/clinics');
      return res.data;
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ clinic_id, verified }: { clinic_id: number; verified: boolean }) => {
      return await api.patch(`/admin/clinics/${clinic_id}/verify`, { verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clinic Governance & Verification</h1>
        <p className="text-sm text-muted-foreground">Verify licensed veterinary clinics before granting booking and ledger privileges.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Registered Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading clinic registry...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Facility Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics && clinics.length > 0 ? (
                  clinics.map((clinic) => (
                    <TableRow key={clinic.clinic_id}>
                      <TableCell className="font-mono text-xs">#{clinic.clinic_id}</TableCell>
                      <TableCell className="font-medium">{clinic.clinic_name}</TableCell>
                      <TableCell>{clinic.location}</TableCell>
                      <TableCell className="text-xs">{clinic.contact_info}</TableCell>
                      <TableCell className="text-xs max-w-xs truncate">{clinic.services_offered}</TableCell>
                      <TableCell>
                        {clinic.verified ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {clinic.verified ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                            onClick={() => toggleVerificationMutation.mutate({ clinic_id: clinic.clinic_id, verified: false })}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-emerald-600 hover:bg-emerald-50"
                            onClick={() => toggleVerificationMutation.mutate({ clinic_id: clinic.clinic_id, verified: true })}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify Clinic
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                      No clinics registered.
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