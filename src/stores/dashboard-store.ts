"use client";

import { create } from "zustand";
import type { DateRangeOption } from "@/components/charts/date-range-selector";

export type SortColumn = "likes" | "comments" | "shares" | "engagement_rate" | "posted_at";
export type SortOrder = "asc" | "desc";
export type PlatformFilter = "all" | "instagram" | "tiktok";

type DashboardState = {
  // Date range / period
  dateRange: DateRangeOption;
  setDateRange: (dateRange: DateRangeOption) => void;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Platform filter
  platformFilter: PlatformFilter;
  setPlatformFilter: (filter: PlatformFilter) => void;

  // Sorting
  sortColumn: SortColumn;
  sortOrder: SortOrder;
  setSort: (column: SortColumn, order: SortOrder) => void;

  // Reset filters
  resetFilters: () => void;
};

const initialState = {
  dateRange: "7d" as DateRangeOption,
  page: 1,
  pageSize: 10,
  platformFilter: "all" as PlatformFilter,
  sortColumn: "posted_at" as SortColumn,
  sortOrder: "desc" as SortOrder,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,

  setDateRange: (dateRange) => set({ dateRange, page: 1 }),

  setPage: (page) => set({ page }),

  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

  setPlatformFilter: (platformFilter) => set({ platformFilter, page: 1 }),

  setSort: (sortColumn, sortOrder) => set({ sortColumn, sortOrder, page: 1 }),

  resetFilters: () => set(initialState),
}));
