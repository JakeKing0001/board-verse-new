import { supabase } from "../lib/supabase";

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users') // la tua tabella
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
