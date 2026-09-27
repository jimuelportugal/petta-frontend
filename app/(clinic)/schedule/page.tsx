# 1. app/(clinic)/schedule/page.tsx
cat << 'EOF' > app/\(clinic\)/schedule/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { Schedule } from '@/types';
import { scheduleSchema, ScheduleFormValues } from '@/lib/validations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClinicSchedulePage() {
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery<Schedule[]>({
    queryKey: ['clinic-schedules'],
    queryFn: async () => {
      const res = await api.get('/clinic/schedules');
      return res.data;
    },
  });

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      day_of_week: 'Monday',
      open_time: '09:00',
      close_time: '17:00',
      max_slots_per_hour: 4,
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async (values: ScheduleFormValues) => {
      return await api.post('/clinic/schedules', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-schedules'] });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operating Hours & Capacity</h1>
        <p className="text-sm text-muted-foreground">Configure clinic hours and maximum booking limits per hour to prevent overcrowding.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Configure Day Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => updateScheduleMutation.mutate(v))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="day_of_week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DAYS.map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="open_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open (HH:MM)</FormLabel>
                        <FormControl>
                          <Input placeholder="09:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="close_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Close (HH:MM)</FormLabel>
                        <FormControl>
                          <Input placeholder="17:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="max_slots_per_hour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Slots / Hour</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={updateScheduleMutation.isPending}>
                  {updateScheduleMutation.isPending ? 'Saving...' : 'Save Schedule'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Active Capacity Limits</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading schedules...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Slots / Hour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules && schedules.length > 0 ? (
                    schedules.map((s) => (
                      <TableRow key={s.schedule_id}>
                        <TableCell className="font-medium">{s.day_of_week}</TableCell>
                        <TableCell className="font-mono text-xs">{s.open_time} - {s.close_time}</TableCell>
                        <TableCell className="font-mono text-xs">{s.max_slots_per_hour} bookings</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">
                        No schedules configured yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
EOF

# 2. app/(auth)/login/page.tsx
cat << 'EOF' > app/\(auth\)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/pets');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Sign in to Petta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            No account? <Link href="/register" className="underline hover:text-foreground">Register</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

# 3. app/(auth)/register/page.tsx
cat << 'EOF' > app/\(auth\)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'vet'>('owner');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(role === 'vet' ? '/dashboard' : '/pets');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Create Petta Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Account Role</Label>
              <Select value={role} onValueChange={(val: 'owner' | 'vet') => setRole(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Pet Owner</SelectItem>
                  <SelectItem value="vet">Veterinarian / Clinic Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Register</Button>
          </form>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Already registered? <Link href="/login" className="underline hover:text-foreground">Sign In</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
EOF