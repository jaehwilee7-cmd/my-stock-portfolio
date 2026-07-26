import { createClient } from '@supabase/supabase-js';

// 환경변수가 비어있을 경우 빌드 에러를 방지하기 위해 기본 URL을 지정합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grskqtwbzgedzitqamhw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyc2txdHdiemdlZHppdHFhbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMzU2NDUsImV4cCI6MjEwMDYxMTY0NX0.Hikwu9xAu89I0iLSOqrHmBPRuz1Y9Vcg4qcSAzEdWmg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
