// app/(owner)/pets/[id]/history/page.tsx
'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Pet, HealthRecord } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Pill, FileText, Calendar, Hash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PetHealthPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const petId = resolvedParams.id;

  const { data: pet, isLoading: petLoading } = useQuery<Pet>({
    queryKey: ['pet', petId],
    queryFn: async () => {
      const res = await api.get(`/pets/${petId}`);
      return res.data;
    },
  });

  const { data: records, isLoading: recordsLoading } = useQuery<HealthRecord[]>({
    queryKey: ['health-records', petId],
    queryFn: async () => {
      const res = await api.get(`/pets/${petId}/records`);
      return res.data;
    },
  });

  if (petLoading || recordsLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading health ledger...</div>;
  }

  if (!pet) {
    return <div className="p-4 text-center text-destructive">Pet record not found.</div>;
  }

  const vaccines = records?.filter((r) => r.record_type === 'vaccine') || [];
  const dewormings = records?.filter((r) => r.record_type === 'deworming') || [];
  const notes = records?.filter((r) => r.record_type === 'note') || [];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Link href="/pets" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to My Pets
      </Link>

      {/* Pet Information Banner */}
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{pet.name}</h1>
                <Badge variant="outline" className="capitalize">{pet.species}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Breed: <span className="font-medium text-foreground">{pet.breed}</span> | DOB: <span className="font-medium text-foreground">{pet.date_of_birth}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md border text-xs">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>Microchip: <strong>{pet.microchip_id || 'Not Registered'}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Read-Only Clinical Ledger Notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-md border">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>Verified Ledger: Clinical records are digitally authenticated and entered strictly by licensed veterinary staff.</span>
      </div>

      {/* Vaccination Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Vaccination Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaccines.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No vaccination entries recorded.</p>
          ) : (
            <div className="divide-y border rounded-md">
              {vaccines.map((v) => (
                <div key={v.record_id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{v.vaccine_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Batch / Lot: <span className="font-mono">{v.batch_lot_number}</span>
                    </p>
                    {v.notes && <p className="text-xs text-muted-foreground mt-1">{v.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{v.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deworming Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-amber-600" />
            Deworming Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dewormings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No deworming logs recorded.</p>
          ) : (
            <div className="divide-y border rounded-md">
              {dewormings.map((d) => (
                <div key={d.record_id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{d.notes || 'Routine Deworming'}</p>
                    {d.batch_lot_number && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Lot: <span className="font-mono">{d.batch_lot_number}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{d.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clinical Notes Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Veterinary Clinical Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No clinical consultation notes recorded.</p>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.record_id} className="p-3 bg-muted/40 rounded-md border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">Veterinarian Entry (ID: {n.vet_id})</span>
                    <span className="text-xs text-muted-foreground">{n.date}</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{n.notes}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}