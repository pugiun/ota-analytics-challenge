"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateRangeOption = "7d" | "30d" | "month";

export type DateRange = {
  option: DateRangeOption;
  current: { start: Date; end: Date };
  previous: { start: Date; end: Date };
  label: string;
  comparisonLabel: string;
};

export function getDateRange(option: DateRangeOption): DateRange {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  switch (option) {
    case "7d": {
      const currentEnd = today;
      const currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - 6);
      currentStart.setHours(0, 0, 0, 0);

      const previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      previousStart.setHours(0, 0, 0, 0);

      return {
        option,
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
        label: "Last 7 days",
        comparisonLabel: "vs. prior 7 days",
      };
    }
    case "30d": {
      const currentEnd = today;
      const currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - 29);
      currentStart.setHours(0, 0, 0, 0);

      const previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 29);
      previousStart.setHours(0, 0, 0, 0);

      return {
        option,
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
        label: "Last 30 days",
        comparisonLabel: "vs. prior 30 days",
      };
    }
    case "month": {
      const currentStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );
      const currentEnd = today;

      const previousStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        0,
        0,
        0,
        0,
      );
      const previousEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );

      return {
        option,
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
        label: "This month",
        comparisonLabel: "vs. last month",
      };
    }
  }
}

type DateRangeSelectorProps = {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
};

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const dateRange = getDateRange(value);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="size-4" />
        <span className="text-sm font-medium">Period:</span>
      </div>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as DateRangeOption)}
      >
        <SelectTrigger className="w-[230px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days vs. prior 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days vs. prior 30 days</SelectItem>
          <SelectItem value="month">This month vs. last month</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground">
        {dateRange.current.start.toLocaleDateString()} -{" "}
        {dateRange.current.end.toLocaleDateString()}
      </span>
    </div>
  );
}
