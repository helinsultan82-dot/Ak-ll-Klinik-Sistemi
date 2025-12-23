import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://updmpmpvmprwkmnbabwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZG1wbXB2bXByd2ttbmJhYndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDg5ODUsImV4cCI6MjA4MTQ4NDk4NX0.b7FQTfzmzA7k0pXtNqxFnZHFxRH5Gqzon51ibKhbDDU';

export const supabase = createClient(supabaseUrl, supabaseKey);