'use server';

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grskqtwbzgedzitqamhw.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyc2txdHdiemdlZHppdHFhbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMzU2NDUsImV4cCI6MjEwMDYxMTY0NX0.Hikwu9xAu89I0iLSOqrHmBPRuz1Y9Vcg4qcSAzEdWmg';
  return createClient(url, key);
}

export async function getPortfolioData() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio:', error);
    return [];
  }
  return data || [];
}

export async function addStockItem(formData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stocks')
    .insert([formData])
    .select();

  if (error) {
    console.error('Error adding stock:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function updateStockItem(id: string, formData: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('stocks')
    .update(formData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating stock:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteStockItem(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('stocks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting stock:', error);
    throw new Error(error.message);
  }
  return true;
}
