// app/(clinic)/records/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { Pet, HealthRecord } from '@/types';
import { healthRecordSchema, HealthRecordFormValues } from '@/lib/validations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Plus, ShieldCheck, Pill, FileText } from 'lucide-react';

export default function ClinicalRecordsManagementPage() {
  const [searchPetId, setSearchPetId] = useState('');
  const [activePetId, setActivePetId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: pet, isFetching: petLoading } = useQuery<Pet>({
    queryKey: ['clinical-pet', activePetId],
    queryFn: async () => {
      if (!activePetId) return null;
      const res = await api.get(`/pets/${activePetId}`);
      return res.data;
    },
    enabled: !!activePetId,
  });

  const { data: records } = useQuery<HealthRecord[]>({
    queryKey: ['clinical-records', activePetId],
    queryFn: async () => {
      if (!activePetId) return [];
      const res = await api.get(`/pets/${activePetId}/records`);
      return res.data;
    },
    enabled: !!activePetId,
  });

  const form = useForm<HealthRecordFormValues>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      pet_id: activePetId || 0,
      record_type: 'vaccine',
      date: new Date().toISOString().split('T')[0],
      vaccine_name: '',
      batch_lot_number: '',
      notes: '',
    },
  });

  const recordType = form.watch('record_type');

  const addRecordMutation = useMutation({
    mutationFn: async (values: HealthRecordFormValues) => {
      return await api.post(`/pets/${values.pet_id}/records`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical-records', activePetId] });
      setIsModalOpen(false);
      form.reset();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPetId.trim()) {
      const id = Number(searchPetId.trim());
      setActivePetId(id);
      form.setValue('pet_id', id);
    }
  };

  const onSubmit = (values: HealthRecordFormValues) => {
    addRecordMutation.mutate(values);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clinical Records Lookup & Entry</h1>
        <p className="text-sm text-muted-foreground">Search patients by Pet ID to review and append authenticated medical entries.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter Pet ID (e.g. 101)"
              value={searchPetId}
              onChange={(e) => setSearchPetId(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" disabled={petLoading}>
              <Search className="h-4 w-4 mr-2" />
              {petLoading ? 'Searching...' : 'Lookup Patient'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {pet && (
        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardContent className="pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{pet.name} (ID: #{pet.pet_id})</h2>
                <p className="text-sm text-muted-foreground">
                  {pet.species} • {pet.breed} • DOB: {pet.date_of_birth} • Chip: {pet.microchip_id || 'N/A'}
                </p>
              </div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Append Medical Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Append Clinical Record for {pet.name}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="record_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Record Classification</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vaccine">Vaccine</SelectItem>
                                <SelectItem value="deworming">Deworming</SelectItem>
                                <SelectItem value="note">Clinical Note</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Administered</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {recordType === 'vaccine' && (
                        <>
                          <FormField
                            control={form.control}
                            name="vaccine_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vaccine Name / Brand</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Rabies, DHPP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="batch_lot_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Batch / Lot Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. LOT-99824X" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {recordType === 'deworming' && (
                        <FormField
                          control={form.control}
                          name="batch_lot_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication Batch / Lot (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. DWM-2026-A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clinical Details / Observations</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter clinical assessment notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={addRecordMutation.isPending}>
                        {addRecordMutation.isPending ? 'Writing to Ledger...' : 'Commit Record'}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Historical Records View */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Verified Historical Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records && records.length > 0 ? (
                  records.map((r) => (
                    <div key={r.record_id} className="p-3 border rounded-md flex justify-between items-start text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {r.record_type === 'vaccine' && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                          {r.record_type === 'deworming' && <Pill className="h-4 w-4 text-amber-600" />}
                          {r.record_type === 'note' && <FileText className="h-4 w-4 text-blue-600" />}
                          <span className="font-semibold capitalize">{r.record_type}</span>
                          {r.vaccine_name && <span>- {r.vaccine_name}</span>}
                        </div>
                        {r.batch_lot_number && (
                          <p className="text-xs font-mono text-muted-foreground">Lot: {r.batch_lot_number}</p>
                        )}
                        {r.notes && <p className="text-xs text-foreground mt-1">{r.notes}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{r.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No historical entries on ledger.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}