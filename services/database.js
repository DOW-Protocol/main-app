import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

export async function getWatchersForAddress(address) {
  console.log('Querying Supabase for address:', address.toLowerCase());
  const { data, error } = await supabase
    .from('watchlist')
    .select('user_id')
    .eq('address', address.toLowerCase());

  if (error) {
    console.error('❌ Error fetching watchlist dari Supabase:', error);
    return [];
  }
  return Array.isArray(data) ? data.map(item => item.user_id) : [];
}

export async function recordAlert(alertObject) {
  const { data, error } = await supabase
    .from('alerts')
    .insert([
      { message: alertObject.text, timestamp: alertObject.timestamp },
    ]);

  if (error) {
    console.error('❌ Error mencatat alert ke Supabase:', error);
  } else {
    console.log('--> Alert berhasil dicatat ke Supabase.');
  }
}