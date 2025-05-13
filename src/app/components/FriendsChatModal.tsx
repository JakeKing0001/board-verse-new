import React, { useState } from "react";
import { Search, ChevronLeft, Send, Paperclip } from "lucide-react";

const mockUsers = [
  { 
    id: 1, 
    name: "Marco Rossi", 
    avatar: "/api/placeholder/40/40", 
    lastMessage: "Ciao, come stai?", 
    time: "10:30",
    unread: 2,
    messages: [
      { id: 1, text: "Ciao!", sender: "them" as "them", time: "10:25" },
      { id: 2, text: "Come stai?", sender: "them" as "them", time: "10:30" },
    ]
  },
  { 
    id: 2, 
    name: "Giulia Bianchi", 
    avatar: "/api/placeholder/40/40", 
    lastMessage: "Ti va di uscire stasera?", 
    time: "09:15",
    unread: 0,
    messages: [
      { id: 1, text: "Ehi!", sender: "me" as "me", time: "09:10" },
      { id: 2, text: "Ti va di uscire stasera?", sender: "them" as "them", time: "09:15" },
    ]
  },
  { 
    id: 3, 
    name: "Luca Verdi", 
    avatar: "/api/placeholder/40/40", 
    lastMessage: "Ho inviato il documento", 
    time: "Ieri",
    unread: 1,
    messages: [
      { id: 1, text: "Ti serve il documento?", sender: "them" as "them", time: "Ieri" },
      { id: 2, text: "Sì, grazie", sender: "me" as "me", time: "Ieri" },
      { id: 3, text: "Ho inviato il documento", sender: "them" as "them", time: "Ieri" },
    ]
  },
  { 
    id: 4, 
    name: "Sofia Neri", 
    avatar: "/api/placeholder/40/40", 
    lastMessage: "Grazie per l'aiuto!", 
    time: "Mar 12",
    unread: 0,
    messages: [
      { id: 1, text: "Mi puoi aiutare con il progetto?", sender: "them" as "them", time: "Mar 12" },
      { id: 2, text: "Certo, quando ti serve?", sender: "me" as "me", time: "Mar 12" },
      { id: 3, text: "Grazie per l'aiuto!", sender: "them" as "them", time: "Mar 12" },
    ]
  }
];

type Message = { id: number; text: string; sender: "me" | "them"; time: string };
type User = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
};

export default function FriendsChatModal({ show, onClose, darkMode, t = {}}: { show: boolean, onClose: () => void, darkMode: boolean, t: any}) {
  const [activeChat, setActiveChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [users, setUsers] = useState<User[]>(mockUsers);
  
  if (!show) return null;
  
  const handleOpenChat = (userId : number) => {
    const user = users.find(u => u.id === userId);
    setActiveChat(user || null);
    // Mark messages as read
    if (user && user.unread > 0) {
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? {...u, unread: 0} : u
        )
      );
    }
  };
  
  const handleBackToList = () => {
    setActiveChat(null);
  };
  
  const handleSendMessage = (e : React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Add new message to chat
    const updatedUsers = users.map(user => {
      if (user.id === activeChat?.id) {
        const newMsg = {
          id: user.messages.length + 1,
          text: newMessage,
          sender: "me" as const,
          time: "Ora"
        };
        return {
          ...user,
          messages: [...user.messages, newMsg],
          lastMessage: newMessage,
          time: "Ora"
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    setNewMessage("");
    // Update active chat with the new messages
    if (activeChat) {
      setActiveChat({
        id: activeChat.id,
        name: activeChat.name,
        avatar: activeChat.avatar,
        lastMessage: newMessage,
        time: "Ora",
        unread: activeChat.unread,
        messages: [
          ...activeChat.messages,
          {
            id: activeChat.messages.length + 1,
            text: newMessage,
            sender: "me" as const,
            time: "Ora"
          }
        ]
      });
    }
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
                <div className={`p-3 rounded-lg ${
                  message.sender === 'me' 
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