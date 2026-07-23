import type { SupabaseClient, User } from '@supabase/supabase-js';

export interface AuthenticatedProfile {
  authUser: User;
  profileId: number;
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 404 = 401,
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const requireAuthenticatedProfile = async (
  supabase: SupabaseClient,
): Promise<AuthenticatedProfile> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new AuthenticationError('Authentication required', 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authData.user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthenticationError('Profile not found', 404);
  }

  return {
    authUser: authData.user,
    profileId: Number(profile.id),
  };
};
