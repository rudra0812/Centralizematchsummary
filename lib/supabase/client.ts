import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

export function createClient() {
  return createSupabaseClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );
}
