import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhamiktnjbxwcryluvof.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYW1pa3RuamJ4d2NyeWx1dm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODc4MjgsImV4cCI6MjA3MzM2MzgyOH0.AWYQl2yxL2iQpKWI4LH0XRLNAYNwlfjsxvGKbQD67io';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
