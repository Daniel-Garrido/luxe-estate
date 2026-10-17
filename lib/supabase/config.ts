// Shared Supabase credentials for the data, browser and server clients
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bjjymugrdmnvkphzniba.supabase.co';
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqanltdWdyZG1udmtwaHpuaWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Mjg5NDgsImV4cCI6MjEwNTUwNDk0OH0.dHp-iK2_k12NDM2YZzEOjlamufIOLzV9IQXAAMDUcXA';
