import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Helper to get the Edge Function base URL
export const edgeFnBase = `${supabaseUrl}/functions/v1/make-server-968c49f6`;
