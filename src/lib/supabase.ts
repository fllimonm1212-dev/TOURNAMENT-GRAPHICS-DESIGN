import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elwubgyhpzodlkozbxai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsd3ViZ3locHpvZGxrb3pieGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDE0NjEsImV4cCI6MjA5MDgxNzQ2MX0.zaP2LqlbNNhIGIvcicLVh5e6bOGLpsoAZ6lAkzsoZP8';

export const supabase = createClient(supabaseUrl, supabaseKey);
