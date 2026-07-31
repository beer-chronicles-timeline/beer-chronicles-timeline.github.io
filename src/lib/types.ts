// lib/types.ts

export type DatePrecision =
  | "date"
  | "month"
  | "year"
  | "decade"
  | "century";

// Raw event row as it comes from Supabase "events" table
export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // ISO date string (DATE in Postgres)
  image_url: string | null;
  created_at: string | null;
  // Extend as your schema grows:
  category?: string | null;
  date_precision?: DatePrecision | null;
  sources?: string | null; // NEW: free-form sources (newline-separated)
};

// Tag row from Supabase "tags" table
export type Tag = {
  id: string;
  name: string;
};

// UI-ready event for the timeline, with tags attached
export type TimelineEvent = EventRow & {
  tags?: Tag[];
};