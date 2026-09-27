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
import { Card, CardTitle, CardContent } from '@/components/ui/card';
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
    queryFn: async (): Promise<Pet[]> => {
      const res = await api.get<Pet[]>('/pets');
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Pets</h1>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            Manage your registered companions and view their medical ledgers.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="clay-btn-primary gap-2 h-11 px-6 text-sm">
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
                        <Input placeholder="e.g. Milo" className="clay-tray border-none h-11 px-4" {...field} />
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
                          <Input placeholder="e.g. Canine" className="clay-tray border-none h-11 px-4" {...field} />
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
                          <Input placeholder="e.g. Golden Retriever" className="clay-tray border-none h-11 px-4" {...field} />
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
                        <Input type="date" className="clay-tray border-none h-11 px-4" {...field} />
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
                        <Input placeholder="e.g. 985141001234567" className="clay-tray border-none h-11 px-4" {...field} />
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
        <div className="text-center py-16 text-sm font-bold text-slate-500">
          Loading pets...
        </div>
      ) : pets && pets.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {pets.map((pet) => (
            <div key={pet.pet_id} className="clay-card p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Title & Badge */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-indigo-500 text-white shadow-sm">
                        <Heart className="h-4 w-4 fill-white" />
                      </div>
                      {pet.name}
                    </CardTitle>
                    <p className="text-xs font-bold text-slate-500">
                      {pet.species} • {pet.breed}
                    </p>
                  </div>
                  <Badge className="clay-badge text-xs px-3 py-1 font-bold">
                    ID #{pet.pet_id}
                  </Badge>
                </div>

                {/* Recessed Inset Clay Tray */}
                <div className="clay-tray p-4 space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>DOB: <strong className="text-slate-900">{pet.date_of_birth}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Hash className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Microchip: <strong className="text-slate-900">{pet.microchip_id || 'Not registered'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Solid Clay Action Button */}
              <div className="pt-2">
                <Link href={`/pets/${pet.pet_id}/history`} className="block">
                  <Button className="w-full clay-btn-primary h-12 gap-2 text-sm font-extrabold tracking-wide">
                    View Health Passport <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="clay-card text-center py-16 p-6">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500 text-white flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-extrabold text-slate-900">No pets registered yet</p>
              <p className="text-xs font-bold text-slate-500">
                Add your pet to start tracking vaccinations, deworming, and appointments.
              </p>
            </div>
            <Button className="clay-btn-primary px-6" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Your First Pet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}