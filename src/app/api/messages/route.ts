import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * Handles the POST request to send a message between two users.
 * 
 * This function checks if a conversation already exists between the sender and receiver.
 * - If a conversation exists, it appends the new message to the existing conversation.
 * - If no conversation exists, it creates a new conversation with the initial message.
 * 
 * The message is stored as an object containing an id, text, timestamp, sender_id, and receiver_id.
 * 
 * @param req - The incoming HTTP request containing senderID, receiverID, and text in the JSON body.
 * @returns A JSON response indicating success or failure, with appropriate HTTP status codes.
 * 
 * @async
 */
export const POST = async (req: Request) => {
    try {
        const { senderID, receiverID, text } = await req.json();

        // Cerca se esiste già una conversazione tra questi due utenti
        const { data: existing} = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${senderID},receiver_id.eq.${receiverID}),and(sender_id.eq.${receiverID},receiver_id.eq.${senderID})`)
            .limit(1)
            .single();

        const newMessage = {
            id: Date.now(), //id unico
            text: text.text,
            time: new Date().toISOString(),
            sender_id: senderID,
            receiver_id: senderID
        };

        if (existing) {
            // Aggiorna l'array dei messaggi
            const updatedText = Array.isArray(existing.text)
                ? [...existing.text, newMessage]
                : [newMessage];

            const { error: updateError } = await supabase
                .from('messages')
                .update({ text: updatedText })
                .eq('id', existing.id);

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 400 });
            }

            return NextResponse.json({ message: 'Message updated successfully' });
        } else {
            // Crea una nuova conversazione
            const { error: insertError } = await supabase
                .from('messages')
                .insert([
                    {
                        sender_id: senderID,
                        receiver_id: receiverID,
                        text: [newMessage],
                    }
                ]);

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 400 });
            }

            return NextResponse.json({ message: 'Message sent successfully' });
        }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
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
export const GET = async () => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('sent_at', { ascending: true });
        if (error) {
            console.error("Supabase error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
};