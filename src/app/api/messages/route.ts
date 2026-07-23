import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';
import {
    AuthenticationError,
    requireAuthenticatedProfile,
} from '../../../../lib/serverAuth';

/**
 * Sends one message from the authenticated profile to a recipient.
 * The sender ID is resolved server-side and the database policy limits recipients to friends.
 *
 * @param req - Request containing `receiverID` and `text` in the JSON body.
 * @returns A JSON response indicating success or failure, with appropriate HTTP status codes.
 * 
 * @async
 */
export const POST = async (req: Request) => {
    try {
        const supabase = createServerSupabase(req);
        const { receiverID, text } = await req.json();
        const numericReceiverId = Number(receiverID);
        const messageText = typeof text?.text === 'string' ? text.text.trim() : '';

        if (!Number.isInteger(numericReceiverId) || numericReceiverId <= 0) {
            return NextResponse.json({ error: 'Invalid receiverID' }, { status: 400 });
        }
        if (!messageText || messageText.length > 2000) {
            return NextResponse.json({ error: 'Message must contain between 1 and 2000 characters' }, { status: 400 });
        }

        const { profileId } = await requireAuthenticatedProfile(supabase);
        if (profileId === numericReceiverId) {
            return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: profileId,
                receiver_id: numericReceiverId,
                text: { content: messageText },
                unread: 1,
            })
            .select('id, sender_id, receiver_id, text, unread, sent_at')
            .single();

        if (error) {
            console.error('Message insert error:', error.message);
            return NextResponse.json({ error: 'Unable to send message' }, { status: 400 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        if (err instanceof AuthenticationError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('Message route error:', err);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
};

export const PATCH = async (req: Request) => {
    try {
        const supabase = createServerSupabase(req);
        const { senderID } = await req.json();
        const numericSenderId = Number(senderID);

        if (!Number.isInteger(numericSenderId) || numericSenderId <= 0) {
            return NextResponse.json({ error: 'Invalid senderID' }, { status: 400 });
        }

        const { profileId } = await requireAuthenticatedProfile(supabase);

        const { error } = await supabase
            .from('messages')
            .update({ unread: 0 })
            .eq('sender_id', numericSenderId)
            .eq('receiver_id', profileId)
            .gt('unread', 0);

        if (error) {
            console.error('Message read update error:', error.message);
            return NextResponse.json({ error: 'Unable to mark messages as read' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Messages marked as read' });
    } catch (err) {
        if (err instanceof AuthenticationError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('Message read route error:', err);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
};

/**
 * Handles GET requests to fetch all messages from the 'messages' table in Supabase.
 * 
 * - Retrieves all messages, ordered by the 'sent_at' timestamp in ascending order.
 * - Returns the messages as a JSON response.
 * - If a Supabase error occurs, returns a JSON error response with status 400.
 * - If an unexpected error occurs, returns a generic JSON error response with status 500.
 *
 * @returns {Promise<Response>} A promise that resolves to a Next.js JSON response containing the messages or an error message.
 */
export const GET = async (req: Request) => {
    try {
        const supabase = createServerSupabase(req);
        const { profileId } = await requireAuthenticatedProfile(supabase);
        const url = new URL(req.url);
        const friendId = Number(url.searchParams.get('friendId'));
        const requestedLimit = Number(url.searchParams.get('limit') ?? 50);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 100)
            : 50;
        const beforeSentAt = url.searchParams.get('beforeSentAt');
        const beforeId = Number(url.searchParams.get('beforeId'));

        if (!Number.isInteger(friendId) || friendId <= 0 || friendId === profileId) {
            return NextResponse.json({ error: 'Invalid friendId' }, { status: 400 });
        }

        let query = supabase
            .from('messages')
            .select('id, sender_id, receiver_id, text, unread, sent_at')
            .or(
                `and(sender_id.eq.${profileId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${profileId})`,
            )
            .order('sent_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(limit + 1);

        if (beforeSentAt) {
            const cursorDate = new Date(beforeSentAt);
            if (Number.isNaN(cursorDate.getTime()) || !Number.isInteger(beforeId) || beforeId <= 0) {
                return NextResponse.json({ error: 'Invalid message cursor' }, { status: 400 });
            }
            const isoCursor = cursorDate.toISOString();
            query = query.or(
                `sent_at.lt.${isoCursor},and(sent_at.eq.${isoCursor},id.lt.${beforeId})`,
            );
        }

        const { data, error } = await query;
        if (error) {
            console.error("Supabase error:", error.message);
            return NextResponse.json({ error: 'Unable to load messages' }, { status: 400 });
        }

        const rows = data ?? [];
        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;
        const oldest = page[page.length - 1];

        return NextResponse.json({
            messages: [...page].reverse(),
            nextCursor: hasMore && oldest
                ? { sentAt: oldest.sent_at, id: oldest.id }
                : null,
        }, {
            headers: { 'Cache-Control': 'private, no-store, max-age=0' },
        });
    } catch (err) {
        if (err instanceof AuthenticationError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
};
