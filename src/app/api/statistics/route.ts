import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';

export const GET = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('get_my_statistics');

    if (error) {
      console.error('Statistics RPC error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Statistics route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
