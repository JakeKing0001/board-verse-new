"use client";

import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { usePieceContext } from './PieceContext';

export default function ProfilePage() {

  interface User {
    avatar?: string;
    username?: string;
    full_name?: string;
    location?: string;
    bio?: string;
  }

  const [isLoading, setIsLoading] = useState(true);

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

  // Stats placeholder - in un'app reale, questi dati verrebbero dal backend
  const stats = {
    partiteGiocate: 104,
    vittorie: 104,
    amici: 104
  };

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
            <h1 className={`text-3xl font-bold${darkMode ? 'text-white' : 'text-green-800 '}`}>{t.profile}</h1>
            <p className="mt-2">{t.profileDescription}</p>
          </div>

          {/* Profilo Content */}
          <div className={`${darkMode ? 'bg-slate-700' : 'bg-white/30'} backdrop-blur-md rounded-2xl shadow-lg overflow-hidden p-6`}>
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

                <h2 className={`mt-4 text-2xl font-bold ${darkMode? 'text-white':'text-green-800'}`}>{user?.username || 'Username'}</h2>
                <p>{user?.full_name || 'Nome Completo'}</p>

                {user?.location && (
                  <div className="flex items-center mt-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{user.location}</span>
                  </div>
                )}

                <div className="mt-6 flex space-x-2">
                  <button className={`px-4 py-2 ${darkMode ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-green-100 text-green-700 hover:bg-green-200'} rounded-full transition-colors text-sm font-medium shadow-sm`}>
                    {t.addFriend}
                  </button>
                  <button className={`px-4 py-2 ${darkMode ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'} rounded-full transition-colors text-sm font-medium shadow-sm`}>
                    {t.sendMessage}
                  </button>
                </div>
              </div>

              {/* Bio e statistiche */}
              <div className="flex-1">
                {user?.bio && (
                  <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-green-800'} mb-2`}>{t.bio}</h3>
                  <p className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg`}>{user.bio}</p>
                  </div>
                )}

                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-green-800'} mb-3`}>{t.statistics}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg text-center shadow-sm`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-green-600'}`}>{stats.partiteGiocate}</p>
                  <p>{t.matchesPlayed}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg text-center shadow-sm`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-green-600'}`}>{stats.vittorie}</p>
                  <p>{t.wins}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} p-4 rounded-lg text-center shadow-sm`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-green-600'}`}>{stats.amici}</p>
                  <p>{t.friends}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sezione Premio */}
            <div className="mt-8">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-green-800'} mb-4`}>{t.reward}</h3>
              <div className={`${darkMode ? 'bg-slate-600' : 'bg-white/50'} rounded-lg p-4 shadow-sm`}>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                    <p className="mt-2 text-sm font-medium">Novizio</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <p className="mt-2 text-sm font-medium">Fulmine</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                      </svg>
                    </div>
                    <p className="mt-2 text-sm font-medium">Stratega</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}