import { supabase } from "@/integrations/supabase/client";

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connected successfully!', data);
    return true;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
}