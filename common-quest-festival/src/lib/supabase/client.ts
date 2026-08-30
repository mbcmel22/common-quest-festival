"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase cote navigateur.
 * La cle "anon" est publique par design : toute la securite repose sur les
 * regles RLS definies dans supabase/schema.sql, jamais sur le secret de la cle.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
