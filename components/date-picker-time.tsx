'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ClinicSlotItem {
  slot: string; // e.g. "09:00", "10:00"
  available: boolean; // false = taken/full (greyed out)
}

interface DatePickerTimeProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  slots: ClinicSlotItem[];
  isLoadingSlots?: boolean;
}

export function DatePickerTime({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  slots,
  isLoadingSlots = false,
}: DatePickerTimeProps) {
  const [openCalendar, setOpenCalendar] = React.useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 w-full max-w-md mx-auto">
      {/* Date Picker Popover */}
      <div className="space-y-1.5 w-full sm:w-1/2">
        <Label className="text-xs text-muted-foreground">Date</Label>
        <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-between font-normal h-9 text-xs',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <span className="truncate">
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </span>
              <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateChange(date);
                setOpenCalendar(false);
              }}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Dropdown with Greying for Booked Slots */}
      <div className="space-y-1.5 w-full sm:w-1/2">
        <Label className="text-xs text-muted-foreground">Time Slot</Label>
        <Select
          value={selectedTime}
          onValueChange={onTimeChange}
          disabled={!selectedDate || isLoadingSlots}
        >
          <SelectTrigger className="w-full h-9 text-xs justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="h-3.5 w-3.5 opacity-50 shrink-0" />
              <SelectValue
                placeholder={
                  !selectedDate
                    ? 'Select date first'
                    : isLoadingSlots
                    ? 'Loading...'
                    : 'Choose slot'
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {slots.length > 0 ? (
              slots.map((item) => (
                <SelectItem
                  key={item.slot}
                  value={item.slot}
                  disabled={!item.available}
                  className={cn(
                    'text-xs',
                    !item.available && 'opacity-40 line-through bg-muted/30 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{item.slot}</span>
                    {!item.available && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        (Taken)
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="py-2 px-3 text-xs text-muted-foreground text-center">
                No slots configured
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
