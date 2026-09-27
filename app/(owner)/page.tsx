// app/(owner)/pets/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { Pet } from '@/types';
import { petSchema, PetFormValues } from '@/lib/validations';
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
import { Plus, Heart, Calendar, Hash, ArrowRight } from 'lucide-react';

export default function MyPetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const res = await api.get('/pets');
      return res.data;
    },
  });

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
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
      return await api.post('/pets', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      setIsModalOpen(false);
      form.reset();
    },
  });

  const onSubmit = (values: PetFormValues) => {
    registerPetMutation.mutate(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Pets</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Manage your registered companions and view their medical ledgers.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="clay-btn-primary gap-2 h-11 px-5">
              <Plus className="h-5 w-5" /> Register Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="clay-card border-none max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold text-slate-800">
                Register New Pet
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">Pet Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Milo" className="clay-input" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Species</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Canine" className="clay-input" {...field} />
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
                        <FormLabel className="font-bold text-slate-700">Breed</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Golden Retriever" className="clay-input" {...field} />
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
                      <FormLabel className="font-bold text-slate-700">Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="clay-input" {...field} />
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
                      <FormLabel className="font-bold text-slate-700">Microchip ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 985141001234567" className="clay-input" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full clay-btn-primary h-12 mt-2"
                  disabled={registerPetMutation.isPending}
                >
                  {registerPetMutation.isPending ? 'Registering...' : 'Save Pet Profile'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm font-semibold text-slate-400">
          Loading pets...
        </div>
      ) : pets && pets.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {pets.map((pet) => (
            <Card key={pet.pet_id} className="clay-card p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-600">
                        <Heart className="h-4 w-4 fill-indigo-600" />
                      </div>
                      {pet.name}
                    </CardTitle>
                    <p className="text-xs font-semibold text-slate-500">
                      {pet.species} • {pet.breed}
                    </p>
                  </div>
                  <Badge variant="outline" className="clay-badge text-xs px-3 py-1">
                    ID #{pet.pet_id}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-600 bg-slate-100/60 p-3.5 rounded-2xl border border-white/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>DOB: <strong>{pet.date_of_birth}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-indigo-500" />
                    <span>Microchip: <strong>{pet.microchip_id || 'Not registered'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Inset Clay Groove Divider */}
              <div className="pt-5 mt-4 border-t border-slate-200/80">
                <Link href={`/pets/${pet.pet_id}/history`} className="block">
                  <Button variant="outline" className="w-full clay-btn-secondary h-11 gap-2">
                    View Health Passport <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="clay-card text-center py-16 p-6">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">No pets registered yet</p>
              <p className="text-xs font-medium text-slate-500">
                Add your pet to start tracking vaccinations, deworming, and appointments.
              </p>
            </div>
            <Button className="clay-btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Your First Pet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}