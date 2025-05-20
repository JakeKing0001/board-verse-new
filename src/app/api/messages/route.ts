import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Assicurati di importare la tua configurazione Supabase

export const POST = async (req: Request) => {
    try {
        const { senderID, receiverID, text } = await req.json();

        // Cerca se esiste già una conversazione tra questi due utenti
        const { data: existing, error: selectError } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${senderID},receiver_id.eq.${receiverID}),and(sender_id.eq.${receiverID},receiver_id.eq.${senderID})`)
            .limit(1)
            .single();

        const newMessage = {
            id: Date.now(), // o un altro id unico
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
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
};

export const GET = async (req: Request) => {
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