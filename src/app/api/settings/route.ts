import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';
import {
  AuthenticationError,
  requireAuthenticatedProfile,
} from '../../../../lib/serverAuth';

const LANGUAGES = new Set(['it', 'en', 'es', 'fr', 'de']);
const THEMES = new Set(['light', 'dark']);
const VISIBILITIES = new Set(['public', 'friends', 'private']);
const TEXT_SIZES = new Set(['small', 'medium', 'large']);

const optionalText = (
  value: unknown,
  maxLength: number,
): string | null | undefined => {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length <= maxLength ? normalized : undefined;
};

export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { authUser } = await requireAuthenticatedProfile(supabase);
    const body = await req.json();

    const fullName = optionalText(body.name, 100);
    const username = optionalText(body.username, 40);
    const avatar = optionalText(body.avatar, 250_000);
    const bio = optionalText(body.bio, 500);
    const location = optionalText(body.location, 100);
    const birthdate = optionalText(body.birthdate, 10);

    const parsedBirthdate = birthdate ? new Date(`${birthdate}T00:00:00Z`) : null;
    if (
      fullName === undefined
      || username === undefined
      || !username
      || avatar === undefined
      || bio === undefined
      || location === undefined
      || birthdate === undefined
      || (birthdate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(birthdate))
      || (
        parsedBirthdate
        && (
          Number.isNaN(parsedBirthdate.getTime())
          || parsedBirthdate.toISOString().slice(0, 10) !== birthdate
          || parsedBirthdate > new Date()
        )
      )
      || !LANGUAGES.has(body.language)
      || !THEMES.has(body.theme)
      || !VISIBILITIES.has(body.profile_visibility)
      || !TEXT_SIZES.has(body.text_size)
    ) {
      return NextResponse.json(
        { error: 'Invalid profile settings' },
        { status: 400 },
      );
    }

    const booleanFields = [
      'notifications_email',
      'notifications_app',
      'newsletter',
      'game_invites',
      'friend_requests',
      'show_online_status',
      'show_play_history',
      'allow_friend_requests',
      'color_blind_mode',
    ] as const;
    if (booleanFields.some((field) => typeof body[field] !== 'boolean')) {
      return NextResponse.json(
        { error: 'Invalid notification or privacy settings' },
        { status: 400 },
      );
    }

    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        username,
        avatar,
        bio,
        location,
        birthdate,
        notifications_email: body.notifications_email,
        notifications_app: body.notifications_app,
        newsletter: body.newsletter,
        game_invites: body.game_invites,
        friend_requests: body.friend_requests,
        profile_visibility: body.profile_visibility,
        show_online_status: body.show_online_status,
        show_play_history: body.show_play_history,
        allow_friend_requests: body.allow_friend_requests,
        language: body.language,
        theme: body.theme,
        color_blind_mode: body.color_blind_mode,
        text_size: body.text_size,
      })
      .eq('auth_user_id', authUser.id)
      .select(`
        id,
        auth_user_id,
        full_name,
        username,
        avatar,
        bio,
        location,
        birthdate,
        notifications_email,
        notifications_app,
        newsletter,
        game_invites,
        friend_requests,
        profile_visibility,
        show_online_status,
        show_play_history,
        allow_friend_requests,
        language,
        theme,
        color_blind_mode,
        text_size
      `)
      .maybeSingle();

    if (error) {
      console.error('Profile settings update error:', error.message);
      return NextResponse.json(
        { error: 'Unable to update profile settings' },
        { status: 400 },
      );
    }
    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found or update not permitted' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: 'Profile settings updated',
      user: {
        ...updatedProfile,
        email: authUser.email ?? '',
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Unexpected profile settings error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
