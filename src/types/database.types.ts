/**
 * Placeholder Supabase generated types.
 * Regenerate with:
 *   supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts
 * The handwritten domain types live in `src/types/index.ts`.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableShape = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: TableShape;
      customer_profiles: TableShape;
      staff: TableShape;
      membership_plans: TableShape;
      customer_memberships: TableShape;
      gym_sessions: TableShape;
      time_slots: TableShape;
      bookings: TableShape;
      payments: TableShape;
      promotions: TableShape;
      notifications: TableShape;
      gym_settings: TableShape;
      referrals: TableShape;
      leads: TableShape;
      newsletter_subscribers: TableShape;
      feedback: TableShape;
      campaigns: TableShape;
      audit_logs: TableShape;
      stripe_events: TableShape;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
