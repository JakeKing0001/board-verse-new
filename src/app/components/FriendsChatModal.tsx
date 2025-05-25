import React, { useEffect, useState } from "react";
import { getMessages, setMessages } from "../../../services/messages";
import { Search, ChevronLeft, Send, Paperclip } from "lucide-react";
import { usePieceContext } from "./PieceContext";
import { supabase } from "../../../lib/supabase";

type Message = { id: number; text: string; time: string; sender: "me" | "them" };
type User = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
};

/**
 * Modal component for chatting with friends.
*
* Displays a list of friends with whom the user has exchanged messages, allows searching contacts,
* and enables real-time chat functionality with message sending and receiving.
* Integrates with Supabase for real-time updates and message persistence.
*
* @param show - Whether the modal is visible.
* @param onClose - Callback to close the modal.
* @param darkMode - Whether dark mode is enabled.
* @param t - Translation object for UI strings.
*
* @remarks
* - Uses context to access the current user, friends, and all users.
* - Subscribes to real-time message events for incoming and outgoing messages.
* - Fetches and displays chat history for each friend.
* - Supports marking messages as read and updating unread counts.
* - Provides a chat interface with message input and sending capability.
*
* @returns The chat modal UI, or null if `show` is false.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FriendsChatModal({ show, onClose, darkMode, t = {}, }: { show: boolean, onClose: () => void, darkMode: boolean, t: any }) {
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { user, friends, allUsers } = usePieceContext();
  const [users, setUsers] = useState<User[]>([]);

  const activeChatRef = React.useRef<User | null>(null);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // sottoscrizione “split” in entrata e in uscita
  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInsert = ({ new: msg }: { new: any }) => {
      // determina l’interlocutore
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

      // estrai il testo
      const text = typeof msg.text === 'string'
        ? msg.text
        : msg.text.content || JSON.stringify(msg.text);

      const newMsg: Message = {
        id: msg.id,
        text,
        time: new Date(msg.sent_at).toLocaleTimeString(),
        sender: msg.sender_id === user.id ? 'me' : 'them',
      };

      // aggiorna solo la chat aperta
      setUsers(prev => {
        const updatedList = prev.map(u =>
          u.id === otherId
            ? {
              ...u,
              lastMessage: newMsg.text,
              time: newMsg.time,
              unread:
                activeChatRef.current?.id === otherId
                  ? 0
                  : u.unread + (newMsg.sender === 'them' ? 1 : 0),
              messages: [...u.messages, newMsg],
            }
            : u
        );

        // Se la chat aperta è proprio quella di otherId, sostituisci activeChat
        if (activeChatRef.current?.id === otherId) {
          const updatedChat = updatedList.find(u => u.id === otherId)!;
          setActiveChat(updatedChat);
        }

        return updatedList;
      });
    };

    const channel = supabase
      .channel('realtime-messages')
      // messaggi in arrivo
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        handleInsert
      )
      // messaggi in uscita
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${user.id}` },
        handleInsert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!activeChat) return;

    const interval = setInterval(() => {
      refreshChatMessages(activeChat.id);
    }, 1050);

    return () => {
      clearInterval(interval);
    };
  }, [activeChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const allMessages = await getMessages();
        const chatUserIds = Array.from(new Set(
          allMessages
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (msg: any) =>
                msg.sender_id === user.id || msg.receiver_id === user.id
            )
            .map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (msg: any) =>
                msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
            )
        ));

        const mappedUsers: User[] = (chatUserIds as number[]).map((otherUserId: number) => {
          const isFriend = friends.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (f: any) =>
              (f.user_id === user.id && f.friend_id === otherUserId) ||
              (f.friend_id === user.id && f.user_id === otherUserId)
          );

          if (!isFriend) return null;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const otherUser = allUsers.find((u: any) => u.id === otherUserId);
          if (!otherUser) return null;

          const messagesBetween = allMessages
            .filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (msg: any) =>
                (msg.sender_id === user.id && msg.receiver_id === otherUserId) ||
                (msg.sender_id === otherUserId && msg.receiver_id === user.id)
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedMessages: Message[] = messagesBetween.flatMap((msg: any) => {
            if (Array.isArray(msg.text)) {
              // msg.text è già un array di messaggi
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return msg.text.map((m: any) => ({
                id: m.id,
                text: m.text,
                time: m.time ? new Date(m.time).toLocaleTimeString() : "",
                sender: m.sender_id === user.id ? "me" : "them",
              }));
            } else {
              // msg.text è un oggetto singolo o stringa
              return [{
                id: msg.id,
                text: typeof msg.text === "string"
                  ? msg.text
                  : (msg.text && (msg.text.content || msg.text.message || JSON.stringify(msg.text))) || "",
                time: msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString() : "",
                sender: msg.sender_id === user.id ? "me" : "them",
              }];
            }
          });

          const lastMsg = mappedMessages[mappedMessages.length - 1];

          return {
            id: otherUser.id,
            name: otherUser.username || otherUser.full_name,
            avatar: otherUser.avatar,
            lastMessage: lastMsg ? lastMsg.text : "",
            time: lastMsg ? lastMsg.time : "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            unread: messagesBetween.filter((msg: any) => msg.receiver_id === user.id && msg.unread > 0).length,
            messages: mappedMessages
          };
        }).filter(Boolean) as User[];

        setUsers(mappedUsers);

      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (user && friends.length > 0 && allUsers.length > 0 && show) {
      fetchMessages();
    }

  }, [user, friends, allUsers, show]);


  if (!show) return null;

  const refreshChatMessages = async (userId: number) => {
    try {
      const allMessages = await getMessages();
      const messagesBetween = allMessages
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (msg: any) =>
            (msg.sender_id === user.id && msg.receiver_id === userId) ||
            (msg.sender_id === userId && msg.receiver_id === user.id)
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedMessages: Message[] = messagesBetween.flatMap((msg: any) => {
        if (Array.isArray(msg.text)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return msg.text.map((m: any) => ({
            id: m.id,
            text: m.text,
            time: m.time ? new Date(m.time).toLocaleTimeString() : "",
            sender: m.sender_id === user.id ? "me" : "them",
          }));
        } else {
          return [{
            id: msg.id,
            text: typeof msg.text === "string"
              ? msg.text
              : (msg.text && (msg.text.content || msg.text.message || JSON.stringify(msg.text))) || "",
            time: msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString() : "",
            sender: msg.sender_id === user.id ? "me" : "them",
          }];
        }
      });

      setActiveChat(prev =>
        prev && prev.id === userId
          ? { ...prev, messages: mappedMessages }
          : prev
      );
    } catch (error) {
      console.error("Error refreshing chat messages:", error);
    }
  };

  const handleOpenChat = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setActiveChat(user || null);
    // Mark messages as read
    if (user && user.unread > 0) {
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, unread: 0 } : u
        )
      );
    }

    refreshChatMessages(userId);
  };

  const handleBackToList = () => {
    setActiveChat(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "me" as const,
      time: new Date().toLocaleTimeString()
    };

    setActiveChat(prev =>
      prev
        ? {
          ...prev,
          lastMessage: newMessage,
          time: newMsg.time,
          messages: [...prev.messages, newMsg]
        }
        : null
    );
    setUsers(users =>
      users.map(user =>
        user.id === activeChat.id
          ? {
            ...user,
            messages: [...user.messages, newMsg],
            lastMessage: newMessage,
            time: newMsg.time
          }
          : user
      )
    );
    setNewMessage("");

    await setMessages({
      senderID: user.id,
      receiverID: activeChat.id,
      text: { text: newMessage }
    });
  };

  return (
    <div className={`fixed right-4 top-20 w-80 md:w-96 h-96 z-50 rounded-lg shadow-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} overflow-hidden flex flex-col`}>
      {!activeChat ? (
        // Chat list view
        <>
          <div className="flex justify-between items-center p-2 bg-slate-700 text-white">
            <h4 className="font-semibold">{t.friendsChat || 'Chat'}</h4>
            <button
              className="text-xl hover:text-red-400"
              onClick={onClose}
              aria-label="Close chat modal"
            >
              &times;
            </button>
          </div>

          <div className="p-2 bg-slate-100 dark:bg-slate-700">
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 rounded-md bg-white dark:bg-slate-600 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t.searchContacts || "Cerca contatti..."}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-200 dark:border-slate-600`}
                onClick={() => handleOpenChat(user.id)}
              >
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{user.name}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{user.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.lastMessage}</p>
                    {user.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {user.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Active chat view
        <>
          <div className={`flex items-center p-3 bg-slate-700 text-white`}>
            <button
              className="mr-2"
              onClick={handleBackToList}
              aria-label="Back to chat list"
            >
              <ChevronLeft size={20} />
            </button>
            <img src={activeChat.avatar} alt={activeChat.name} className="w-8 h-8 rounded-full mr-3" />
            <div className="flex-1">
              <h4 className="font-medium">{activeChat.name}</h4>
            </div>
            <button
              className="text-xl hover:text-red-400"
              onClick={onClose}
              aria-label="Close chat modal"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-slate-200 dark:bg-slate-900">
            {activeChat.messages.map(message => (
              <div
                key={message.id}
                className={`max-w-xs mb-2 ${message.sender === 'me' ? 'ml-auto' : 'mr-auto'}`}
              >
                <div className={`p-3 rounded-lg ${message.sender === 'me'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : darkMode
                    ? 'bg-slate-700 text-white rounded-bl-none'
                    : 'bg-white text-gray-800 rounded-bl-none'
                  }`}>
                  {message.text}
                </div>
                <div className={`text-xs mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'} text-gray-500`}>
                  {message.time}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-slate-700 flex items-center">
            <button type="button" className="text-gray-500 dark:text-gray-400 mr-2">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 py-2 px-3 rounded-full bg-slate-100 dark:bg-slate-700 focus:outline-none text-sm"
              placeholder={t.typeMessage || "Scrivi un messaggio..."}
            />
            <button
              type="submit"
              className="ml-2 text-white bg-blue-500 p-2 rounded-full disabled:opacity-50"
              disabled={!newMessage.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}