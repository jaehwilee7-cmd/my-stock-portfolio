'server-only';

import { supabase } from '@/lib/supabase';
import { StockItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getPortfolioData(): Promise<StockItem[]> {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio:', error);
    return [];
  }

  return data as StockItem[];
}

export async function addStockItem(item: Omit<StockItem, 'id'>) {
  const { error } = await supabase.from('portfolio').insert([item]);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

export async function updateStockItem(id: string, item: Partial<StockItem>) {
  const { error } = await supabase.from('portfolio').update(item).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

export async function deleteStockItem(id: string) {
  const { error } = await supabase.from('portfolio').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}
