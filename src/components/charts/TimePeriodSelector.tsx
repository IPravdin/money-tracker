"use client";

import { TimePeriod } from "@/lib/utils/insights";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

export function TimePeriodSelector({
  selectedPeriod,
  onPeriodChange,
  className,
}: TimePeriodSelectorProps) {
  const periods: Array<{ value: TimePeriod; label: string; icon: React.ReactNode }> = [
    { value: "week", label: "Week", icon: <Calendar className="h-4 w-4" /> },
    { value: "month", label: "Month", icon: <CalendarDays className="h-4 w-4" /> },
    { value: "year", label: "Year", icon: <CalendarRange className="h-4 w-4" /> },
  ];

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className="flex items-center gap-2"
        >
          {period.icon}
          {period.label}
        </Button>
      ))}
    </div>
  );
}
