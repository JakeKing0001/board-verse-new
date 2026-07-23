import React, { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  getConversationSummaries,
  getMessages,
  markMessagesRead,
  setMessages,
} from "../../../services/messages";
import { Search, ChevronLeft, Send, X } from "lucide-react";
import { usePieceContext } from "./PieceContext";
import { supabase } from "../../../lib/supabase";
import clsx from 'clsx';
import type {
  ChatMessage,
  MessageCursor,
  UserProfile,
} from "../../types/domain";

type Message = { id: number | string; text: string; time: string; sender: "me" | "them" };
type StoredMessageRow = Omit<ChatMessage, 'text' | 'sent_at' | 'unread'> & {
  text: unknown;
  sent_at?: string;
  unread?: number;
};
type User = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  lastSentAt: string | null;
  unread: number;
  messages: Message[];
};

const extractMessageText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const content = record.content ?? record.message ?? record.text;
    return typeof content === 'string' ? content : '';
  }
  return '';
};

const mapStoredMessages = (row: StoredMessageRow, currentUserId: number): Message[] => {
  if (Array.isArray(row.text)) {
    return row.text.flatMap((entry, index) => {
      const text = extractMessageText(entry);
      if (!text) return [];
      const record = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
      return [{
        id: typeof record.id === 'number' ? record.id : `${row.id}-${index}`,
        text,
        time: typeof record.time === 'string'
          ? new Date(record.time).toLocaleTimeString()
          : row.sent_at ? new Date(row.sent_at).toLocaleTimeString() : '',
        sender: Number(record.sender_id ?? row.sender_id) === currentUserId ? 'me' as const : 'them' as const,
      }];
    });
  }

  const text = extractMessageText(row.text);
  if (!text) return [];
  return [{
    id: row.id,
    text,
    time: row.sent_at ? new Date(row.sent_at).toLocaleTimeString() : '',
    sender: row.sender_id === currentUserId ? 'me' : 'them',
  }];
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
export default function FriendsChatModal({
  show,
  onClose,
  darkMode,
  t = {},
}: {
  show: boolean;
  onClose: () => void;
  darkMode: boolean;
  t: Record<string, string>;
}) {
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageCursor, setMessageCursor] = useState<MessageCursor | null>(null);
  const { user, friends, allUsers } = usePieceContext();
  const [users, setUsers] = useState<User[]>([]);
  const dialogTitleId = useId();

  const activeChatRef = React.useRef<User | null>(null);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const mergeStoredMessage = useCallback((row: StoredMessageRow) => {
    if (!user) return;
    const otherId = row.sender_id === user.id ? row.receiver_id : row.sender_id;
    const messages = mapStoredMessages(row, user.id);
    if (messages.length === 0) return;

    const merge = (chat: User): User => {
      const unseenMessages = messages.filter(
        (message) => !chat.messages.some((existing) => existing.id === message.id),
      );
      if (unseenMessages.length === 0) return chat;
      const lastMessage = unseenMessages[unseenMessages.length - 1];
      return {
        ...chat,
        lastMessage: lastMessage.text,
        time: lastMessage.time,
        lastSentAt: row.sent_at ?? chat.lastSentAt,
        unread: activeChatRef.current?.id === otherId
          ? 0
          : chat.unread + unseenMessages.filter((message) => message.sender === 'them').length,
        messages: [...chat.messages, ...unseenMessages],
      };
    };

    setUsers((previous) => previous.map((chat) => chat.id === otherId ? merge(chat) : chat));
    setActiveChat((previous) => previous?.id === otherId ? merge(previous) : previous);
  }, [user]);

  // sottoscrizione “split” in entrata e in uscita
  useEffect(() => {
    if (!user) return;

    const handleInsert = ({ new: message }: { new: StoredMessageRow }) => {
      mergeStoredMessage(message);
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
  }, [mergeStoredMessage, user]);

  useEffect(() => {
    if (!show || !user) return;
    let cancelled = false;
    setLoadError(null);

    const friendUserIds = Array.from(new Set(
      friends.map((friend) =>
        friend.user_id === user.id ? friend.friend_id : friend.user_id,
      ),
    ));

    const mappedUsers = friendUserIds
      .map((otherUserId: number): User | null => {
        const otherUser = (allUsers as UserProfile[]).find(
          (candidate) => candidate.id === otherUserId,
        );
        if (!otherUser) return null;

        return {
          id: otherUser.id,
          name: otherUser.username || otherUser.full_name || `Utente ${otherUser.id}`,
          avatar: otherUser.avatar || '/default_avatar.png',
          lastMessage: '',
          time: '',
          lastSentAt: null,
          unread: 0,
          messages: [],
        };
      })
      .filter((chatUser): chatUser is User => chatUser !== null);

    setUsers((previous) =>
      mappedUsers.map((chatUser) => {
        const existing = previous.find((candidate) => candidate.id === chatUser.id);
        return existing
          ? { ...existing, name: chatUser.name, avatar: chatUser.avatar }
          : chatUser;
      }),
    );

    void getConversationSummaries()
      .then((summaries) => {
        if (cancelled) return;
        setUsers((previous) =>
          previous
            .map((chatUser) => {
              const summary = summaries.find(
                (candidate) => candidate.friend_id === chatUser.id,
              );
              return summary
                ? {
                    ...chatUser,
                    lastMessage: summary.last_message ?? '',
                    time: summary.last_sent_at
                      ? new Date(summary.last_sent_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '',
                    lastSentAt: summary.last_sent_at,
                    unread: Number(summary.unread_count) || 0,
                  }
                : chatUser;
            })
            .sort((left, right) => {
              if (!left.lastSentAt) return 1;
              if (!right.lastSentAt) return -1;
              return right.lastSentAt.localeCompare(left.lastSentAt);
            }),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Le conversazioni non sono disponibili in questo momento.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, friends, allUsers, show]);

  useEffect(() => {
    if (!show) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, show]);

  const refreshChatMessages = async (userId: number) => {
    if (!user) return;
    setIsLoadingMessages(true);
    try {
      setLoadError(null);
      const page = await getMessages(userId);
      const mappedMessages: Message[] = page.messages.flatMap(
        (message: StoredMessageRow) => mapStoredMessages(message, user.id),
      );
      const lastMessage = mappedMessages[mappedMessages.length - 1];
      const lastStoredMessage = page.messages[page.messages.length - 1];

      setMessageCursor(page.nextCursor);
      setUsers((previous) =>
        previous.map((chat) =>
          chat.id === userId
            ? {
                ...chat,
                messages: mappedMessages,
                lastMessage: lastMessage?.text ?? chat.lastMessage,
                time: lastMessage?.time ?? chat.time,
                lastSentAt: lastStoredMessage?.sent_at ?? chat.lastSentAt,
              }
            : chat,
        ),
      );
      setActiveChat((previous) =>
        previous?.id === userId
          ? {
              ...previous,
              messages: mappedMessages,
              lastMessage: lastMessage?.text ?? previous.lastMessage,
              time: lastMessage?.time ?? previous.time,
              lastSentAt: lastStoredMessage?.sent_at ?? previous.lastSentAt,
            }
          : previous,
      );
    } catch {
      setLoadError('Non è stato possibile caricare i messaggi.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!user || !activeChat || !messageCursor || isLoadingMessages) return;
    setIsLoadingMessages(true);
    try {
      const page = await getMessages(activeChat.id, messageCursor);
      const olderMessages = page.messages.flatMap((message: StoredMessageRow) =>
        mapStoredMessages(message, user.id),
      );
      setActiveChat((previous) =>
        previous
          ? {
              ...previous,
              messages: [
                ...olderMessages.filter(
                  (message) =>
                    !previous.messages.some((current) => current.id === message.id),
                ),
                ...previous.messages,
              ],
            }
          : previous,
      );
      setMessageCursor(page.nextCursor);
    } catch {
      setLoadError('Non è stato possibile caricare i messaggi precedenti.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  if (!show || typeof document === 'undefined') return null;

  const handleOpenChat = (userId: number) => {
    const chatUser = users.find((candidate) => candidate.id === userId);
    setActiveChat(chatUser || null);
    setMessageCursor(null);
    // Mark messages as read
    if (chatUser && chatUser.unread > 0) {
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, unread: 0 } : u
        )
      );
      void markMessagesRead(userId).catch(() => {
        setLoadError('I messaggi sono aperti, ma lo stato di lettura non è stato aggiornato.');
      });
    }

    void refreshChatMessages(userId);
  };

  const handleBackToList = () => {
    setActiveChat(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    if (!messageText || !activeChat || isSending) return;

    setIsSending(true);
    setSendError(null);
    setNewMessage("");
    try {
      const storedMessage = await setMessages({
        receiverID: activeChat.id,
        text: { text: messageText }
      });
      mergeStoredMessage(storedMessage);
    } catch {
      setNewMessage(messageText);
      setSendError('Invio non riuscito. Riprova.');
    } finally {
      setIsSending(false);
    }
  };

  const visibleUsers = users.filter((chatUser) =>
    chatUser.name.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
  );

  return createPortal(
    <>
      <div
        className="bv-modal-backdrop fixed inset-0 z-[135]"
        aria-hidden="true"
        onMouseDown={onClose}
      />
      <div
        className={clsx(
          'bv-glass-strong bv-liquid fixed inset-x-3 top-20 z-[140] flex h-[min(34rem,calc(100dvh-6rem))] flex-col overflow-hidden rounded-[1.75rem] text-[var(--bv-text)] shadow-2xl sm:left-auto sm:right-4 sm:w-96',
          darkMode ? 'border-white/10' : 'border-white/80'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
      >
      {!activeChat ? (
        // Chat list view
        <>
          <div className="flex items-center justify-between border-b border-black/5 bg-white/15 p-3 dark:border-white/10 dark:bg-white/5">
            <h2 id={dialogTitleId} className="font-semibold">{t.friendsChat || 'Chat amici'}</h2>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-rose-500/10 hover:text-rose-500"
              onClick={onClose}
              aria-label={t.close || 'Chiudi'}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="p-3">
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="bv-input block w-full py-2 pl-10 pr-3 text-sm"
                placeholder={t.searchContacts || "Cerca contatti..."}
                aria-label={t.searchContacts || 'Cerca contatti'}
              />
            </div>
            {loadError && (
              <p className="mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-700 dark:text-amber-200" role="status">
                {loadError}
              </p>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {visibleUsers.map(chatUser => (
              <button
                type="button"
                key={chatUser.id}
                className="flex w-full items-center border-b border-black/5 p-3 text-left transition hover:bg-emerald-500/10 dark:border-white/10"
                onClick={() => handleOpenChat(chatUser.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={chatUser.avatar || '/default_avatar.png'} alt={chatUser.name} className="w-10 h-10 rounded-full mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{chatUser.name}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{chatUser.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chatUser.lastMessage}</p>
                    {chatUser.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {chatUser.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {visibleUsers.length === 0 && (
              <p className="p-5 text-center text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Nessun contatto trovato.' : 'Aggiungi un amico per iniziare una chat.'}
              </p>
            )}
          </div>
        </>
      ) : (
        // Active chat view
        <>
          <div className="flex items-center border-b border-black/5 bg-white/15 p-3 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              className="mr-2"
              onClick={handleBackToList}
              aria-label="Back to chat list"
            >
              <ChevronLeft size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeChat.avatar || '/default_avatar.png'} alt={activeChat.name} className="w-8 h-8 rounded-full mr-3" />
            <div className="flex-1">
              <h2 id={dialogTitleId} className="font-medium">{activeChat.name}</h2>
            </div>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-rose-500/10 hover:text-rose-500"
              onClick={onClose}
              aria-label={t.close || 'Chiudi'}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-black/[0.025] p-3 dark:bg-black/15">
            {loadError && (
              <p className="mb-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-700 dark:text-amber-200" role="status">
                {loadError}
              </p>
            )}
            {messageCursor && (
              <button
                type="button"
                onClick={loadOlderMessages}
                disabled={isLoadingMessages}
                className="mx-auto mb-3 block rounded-full bg-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200"
              >
                {isLoadingMessages
                  ? (t.loading || 'Caricamento...')
                  : (t.loadPreviousMessages || 'Carica messaggi precedenti')}
              </button>
            )}
            {!isLoadingMessages && activeChat.messages.length === 0 && (
              <p className="my-8 text-center text-sm text-slate-500">
                {t.noMessagesYet || 'Nessun messaggio: scrivi per iniziare.'}
              </p>
            )}
            {activeChat.messages.map(message => (
              <div
                key={message.id}
                className={clsx(
                  'max-w-xs mb-2',
                  message.sender === 'me' ? 'ml-auto' : 'mr-auto'
                )}
              >
                <div
                  className={clsx(
                    'p-3 rounded-lg',
                    message.sender === 'me'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none'
                      : darkMode
                        ? 'bg-slate-700 text-white rounded-bl-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                  )}
                >
                  {message.text}
                </div>
                <div
                  className={clsx(
                    'text-xs mt-1 text-gray-500',
                    message.sender === 'me' ? 'text-right' : 'text-left'
                  )}
                >
                  {message.time}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center border-t border-black/5 p-3 dark:border-white/10">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="bv-input w-full rounded-full px-3 py-2 text-sm"
                placeholder={t.typeMessage || "Scrivi un messaggio..."}
                maxLength={2000}
                aria-label={t.typeMessage || 'Scrivi un messaggio'}
              />
              {sendError && <p className="mt-1 text-xs text-red-500" role="alert">{sendError}</p>}
            </div>
            <button
              type="submit"
              className="ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              disabled={!newMessage.trim() || isSending}
              aria-label="Invia messaggio"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </>
      )}
      </div>
    </>,
    document.body,
  );
}
