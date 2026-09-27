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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Pets</h1>
          <p className="text-sm text-muted-foreground">
            Manage your registered companions and view their medical ledgers.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Register Pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Pet</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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