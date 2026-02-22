import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;

console.log("[v0] Supabase URL:", supabaseUrl);
console.log("[v0] Supabase anon key (first 20):", publicAnonKey.substring(0, 20));

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Helper to get the Edge Function base URL
export const edgeFnBase = `${supabaseUrl}/functions/v1/make-server-968c49f6`;
