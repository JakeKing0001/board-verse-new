"use client";

import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { usePieceContext } from './PieceContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  const router = useRouter();

  const { user, setUser, t, darkMode} = usePieceContext();

  useEffect(() => {
    const loadUser = () => {
      setIsLoading(true);
      const userData = user;
      setUser(userData);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Preferenze utente (mock data semplice)
  const preferences = {
    tema: darkMode ? 'Scuro' : 'Chiaro',
    lingua: 'Italiano',
    notifiche: true,
    suoni: true,
    membro_da: 'Gennaio 2024'
  };

  // Hobby e interessi
  const interests = [
    'Scacchi', 'Dama', 'Strategia', 'Puzzle', 'Lettura', 'Musica'
  ];

  if (isLoading) {
    return (
      <>
        <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
          <NavBar current={-1} />
        </div>
        <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100'} pt-24 pb-16 flex items-center justify-center`}>
          <div className={`animate-spin h-12 w-12 border-4 ${darkMode ? 'border-slate-500' : 'border-green-500'} rounded-full border-t-transparent`}></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
        <NavBar current={-1} />
      </div>

      <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100 text-black'} pt-24 pb-16 px-4`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`${darkMode ? 'bg-slate-700' : 'bg-white/30'} backdrop-blur-md rounded-2xl p-6 shadow-lg mb-6`}>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.profile}</h1>
            <p className="mt-2">{t.profileDescription}</p>
          </div>

          {/* Profilo Content */}
          <div className={`${darkMode ? 'bg-slate-700' : 'bg-white/30'} backdrop-blur-md rounded-2xl shadow-lg overflow-hidden p-6 mb-6`}>
            {/* Sezione principale del profilo */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar e informazioni base */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={user?.avatar || '/default_avatar.png'}
                    alt="Immagine profilo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className={`mt-4 text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-800'}`}>{user?.username || 'Username'}</h2>
                <p className="text-lg opacity-80">{user?.full_name || 'Nome Completo'}</p>

                {user?.location && (
                  <div className="flex items-center mt-2 opacity-75">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{user.location}</span>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <button className={`px-6 py-2 ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'} rounded-full transition-colors text-sm font-medium shadow-sm`}
                    onClick={() => router.push('/friends')}>
                    {t.addFriend || 'Aggiungi Amico'}
                  </button>
                  <button className={`px-6 py-2 ${darkMode ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full transition-colors text-sm font-medium shadow-sm`}>
                    Messaggio
                  </button>
                </div>
              </div>

              {/* Bio section */}
              <div className="flex-1 text-center md:text-left">
                <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-6 rounded-xl mb-4`}>
                  <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-green-800'} flex items-center`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Chi sono
                  </h3>
                  <p className="opacity-90 leading-relaxed">
                    {user?.bio || 'Ciao! Sono un appassionato di giochi strategici e mi piace sfidare la mia mente con puzzle e enigmi. Quando non gioco, amo passare il tempo leggendo e ascoltando musica. Sempre pronto per una nuova sfida!'}
                  </p>
                </div>

                {/* Interessi */}
                <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-6 rounded-xl`}>
                  <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-green-800'} flex items-center`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    I miei interessi
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                        darkMode ? 'bg-slate-500 text-white' : 'bg-green-100 text-green-800'
                      }`}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs per informazioni aggiuntive */}
          <div className={`${darkMode ? 'bg-slate-700' : 'bg-white/30'} backdrop-blur-md rounded-2xl shadow-lg overflow-hidden`}>
            {/* Tab Navigation */}
            <div className="flex border-b border-opacity-20">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'info'
                    ? (darkMode ? 'bg-slate-600 text-white' : 'bg-white/50 text-green-800')
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                📋 Informazioni
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'settings'
                    ? (darkMode ? 'bg-slate-600 text-white' : 'bg-white/50 text-green-800')
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                ⚙️ Preferenze
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg`}>
                      <h4 className="font-semibold mb-2 flex items-center">
                        📅 Membro da
                      </h4>
                      <p className="opacity-80">{preferences.membro_da}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg`}>
                      <h4 className="font-semibold mb-2 flex items-center">
                        🌍 Lingua preferita
                      </h4>
                      <p className="opacity-80">{preferences.lingua}</p>
                    </div>
                  </div>
                  
                  <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg`}>
                    <h4 className="font-semibold mb-3">📝 Stato</h4>
                    <p className="opacity-80">
                      🟢 Online - Pronto per nuove sfide!
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg`}>
                    <h4 className="font-semibold mb-3">🎨 Tema</h4>
                    <p className="opacity-80">{preferences.tema}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg`}>
                      <h4 className="font-semibold mb-2">🔔 Notifiche</h4>
                      <p className="opacity-80">{preferences.notifiche ? 'Abilitate' : 'Disabilitate'}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg`}>
                      <h4 className="font-semibold mb-2">🔊 Suoni</h4>
                      <p className="opacity-80">{preferences.suoni ? 'Abilitati' : 'Disabilitati'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}