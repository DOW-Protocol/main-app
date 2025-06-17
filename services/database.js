import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

export async function getWatchlistedUsersForAddress(address) {
  const { data, error } = await supabase
    .from('watchlist')
    .select('user_id')
    .eq('address', address.toLowerCase());

  if (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
  return data.map(item => item.user_id);
}