import { createClient } from '@supabase/supabase-js';

// Directly use the provided Supabase credentials to connect the application.
const supabaseUrl = 'https://ysgoczfnxnwuhxtuinyl.supabase.co';
const supabaseAnonKey = 'sb_publishable_P3zYFAjhqyb3j9tCi91VAw__si7-hsX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
