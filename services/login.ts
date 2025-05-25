import { supabase } from "../lib/supabase";

/**
 * Retrieves all users from the 'users' table in the Supabase database.
 *
 * @returns {Promise<any[]>} A promise that resolves to an array of user objects.
 * @throws {Error} Throws an error if the Supabase query fails.
 */
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
