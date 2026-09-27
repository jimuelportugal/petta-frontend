// app/(owner)/pets/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Pet } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Heart, Calendar, Hash, ArrowRight, AlertCircle } from 'lucide-react';

const petFormSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().min(1, 'Breed is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  microchip_id: z.string().optional(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function MyPetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: pets, isLoading, error: fetchError } = useQuery<Pet[]>({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const res = await api.get('/pets');
      return res.data;
    },
  });

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      date_of_birth: '',
      microchip_id: '',
    },
  });

  const registerPetMutation = useMutation({
    mutationFn: async (values: PetFormValues) => {
      const payload = {
        ...values,
        microchip_id: values.microchip_id?.trim() ? values.microchip_id.trim() : null,
      };
      const res = await api.post('/pets', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      setIsModalOpen(false);
      setServerError(null);
      form.reset();
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Server failed to save pet profile. Check if backend is running and authenticated.';
      setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });

  const onSubmit = (values: PetFormValues) => {
    setServerError(null);
    registerPetMutation.mutate(values);
  };

  const onInvalid = (errors: any) => {
    console.error('Validation Errors in Form:', errors);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Pets</h1>
          <p className="text-sm text-muted-foreground">
            Manage your registered companions and view their medical ledgers.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setServerError(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Register Pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Pet</DialogTitle>
            </DialogHeader>

            {serverError && (
              <div className="p-3 bg-destructive/15 border border-destructive/30 rounded text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Milo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Species</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Canine / Dog" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="breed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Breed</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Golden Retriever" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="microchip_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Microchip ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 985141001234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerPetMutation.isPending}
                >
                  {registerPetMutation.isPending ? 'Registering...' : 'Save Pet Profile'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {fetchError && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Could not load pet list. Check backend API connection at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}.</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Loading pets...
        </div>
      ) : pets && pets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {pets.map((pet) => (
            <Card key={pet.pet_id} className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      {pet.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pet.species} • {pet.breed}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ID #{pet.pet_id}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>DOB: {pet.date_of_birth}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    <span>Microchip: {pet.microchip_id || 'Not registered'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <Link href={`/pets/${pet.pet_id}/history`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                      View Health Passport <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-3">
            <Heart className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">No pets registered</p>
              <p className="text-xs text-muted-foreground">
                Add your pet to start tracking vaccinations, deworming, and appointments.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Your First Pet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}