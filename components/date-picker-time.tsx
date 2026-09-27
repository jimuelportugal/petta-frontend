// components/date-picker-time.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface DatePickerTimeProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  selectedTime?: string;
  onTimeChange: (time: string) => void;
  slots: any[];
  isLoadingSlots?: boolean;
}

export function DatePickerTime({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  slots = [],
  isLoadingSlots = false,
}: DatePickerTimeProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Normalize slot item whether backend returns ["09:00"] or [{ time: "09:00" }] or [{ slot: "09:00" }]
  const parseSlotValue = (slot: any): string => {
    if (typeof slot === 'string') return slot;
    if (typeof slot === 'object' && slot !== null) {
      return slot.time || slot.slot || slot.time_slot || slot.label || JSON.stringify(slot);
    }
    return String(slot);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
      {/* Date Picker via Popover */}
      <div className="space-y-2 flex flex-col">
        <Label className="text-sm font-medium">Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 w-full justify-start text-left font-normal border-input bg-background px-3",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 border shadow-md" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateChange(date);
                setIsCalendarOpen(false);
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Slot Selector */}
      <div className="space-y-2 flex flex-col">
        <Label className="text-sm font-medium">Time Slot</Label>
        <Select
          value={selectedTime || ""}
          onValueChange={onTimeChange}
          disabled={!selectedDate || isLoadingSlots}
        >
          <SelectTrigger className="h-10 w-full justify-between px-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 opacity-70" />
              <SelectValue
                placeholder={
                  !selectedDate
                    ? "Select date first"
                    : isLoadingSlots
                    ? "Loading available slots..."
                    : "Choose time slot"
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent className="z-50 max-h-56">
            {slots && slots.length > 0 ? (
              slots.map((rawSlot, index) => {
                const slotValue = parseSlotValue(rawSlot);
                return (
                  <SelectItem key={`${slotValue}-${index}`} value={slotValue}>
                    {slotValue}
                  </SelectItem>
                );
              })
            ) : (
              <div className="p-3 text-xs text-center text-muted-foreground">
                No slots available on this date
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}