"use client";

import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { usePieceContext } from './PieceContext';
import { settingsUser } from '../../../services/auth';
import toast from 'react-hot-toast';
import { debugLog } from '../../../lib/debug';

const normalizeLanguage = (language?: string | null) => {
  const aliases: Record<string, string> = {
    italiano: 'it',
    english: 'en',
    español: 'es',
    français: 'fr',
    deutsch: 'de',
  };
  const normalized = language?.toLocaleLowerCase() ?? 'it';
  return aliases[normalized] ?? (
    ['it', 'en', 'es', 'fr', 'de'].includes(normalized) ? normalized : 'it'
  );
};

/**
 * ProfileSettings component provides a user interface for managing and updating user profile settings.
 * 
 * This component allows users to:
 * - View and edit personal information (name, username, bio, location, birthdate, avatar).
 * - Configure notification preferences (email, app, newsletter, game invites, friend requests).
 * - Adjust privacy settings (profile visibility, online status, play history, friend requests).
 * - Set application preferences (language, theme, color blind mode, text size).
 * 
 * The component uses tabs to organize settings into logical sections and provides a form for updating user data.
 * It handles avatar uploads, input changes, and form submission with loading and success feedback.
 * 
 * @component
 * @returns {JSX.Element} The rendered profile settings page.
 * 
 * @remarks
 * - Requires user context from `usePieceContext`.
 * - Uses Tailwind CSS for styling and supports dark mode.
 * - Calls `settingsUser` to persist changes and displays toast notifications on success.
 * - Avatar upload is handled locally for demonstration; in production, integrate with backend.
 * 
 * @example
 * 
 * <ProfileSettings />
 * 
 */
export default function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [avatar, setAvatar] = useState('default_avatar.png'); // Path to default avatar image
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const {
    user,
    t,
    darkMode,
    setDarkMode,
    setLanguage,
    setUser,
  } = usePieceContext();

  interface ProfileData {
    name: string;
    username: string;
    email: string;
    avatar: string;
    bio: string;
    location: string;
    birthdate: string;
    notifications_email: boolean;
    notifications_app: boolean;
    newsletter: boolean;
    game_invites: boolean;
    friend_requests: boolean;
    profile_visibility: string;
    show_online_status: boolean;
    show_play_history: boolean;
    allow_friend_requests: boolean;
    language: string;
    theme: string;
    color_blind_mode: boolean;
    text_size: string;
  }

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || 'default_avatar.png',
        bio: user.bio || '',
        location: user.location || '',
        birthdate: user.birthdate || '',
        notifications_email: user.notifications_email || false,
        notifications_app: user.notifications_app || false,
        newsletter: user.newsletter || false,
        game_invites: user.game_invites || false,
        friend_requests: user.friend_requests || false,
        profile_visibility: user.profile_visibility || 'public',
        show_online_status: user.show_online_status || false,
        show_play_history: user.show_play_history || false,
        allow_friend_requests: user.allow_friend_requests || false,
        language: normalizeLanguage(user.language),
        theme: user.theme || 'light',
        color_blind_mode: user.color_blind_mode || false,
        text_size: user.text_size || 'medium',
      });
    }

    debugLog('User data set:', user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setProfileData(prev => {
      if (!prev) return null;

      // Gestione corretta per i campi nidificati
      if (name.includes('.')) {
        const [category, field] = name.split('.');

        // Mappa i nomi dei campi dal formato con punto al formato con underscore
        let actualFieldName = '';

        switch (`${category}.${field}`) {
          case 'notifications.email':
            actualFieldName = 'notifications_email';
            break;
          case 'notifications.app':
            actualFieldName = 'notifications_app';
            break;
          case 'notifications.newsletter':
            actualFieldName = 'newsletter';
            break;
          case 'notifications.gameInvites':
            actualFieldName = 'game_invites';
            break;
          case 'notifications.friendRequests':
            actualFieldName = 'friend_requests';
            break;
          case 'privacy.profileVisibility':
            actualFieldName = 'profile_visibility';
            break;
          case 'privacy.showOnlineStatus':
            actualFieldName = 'show_online_status';
            break;
          case 'privacy.showPlayHistory':
            actualFieldName = 'show_play_history';
            break;
          case 'privacy.allowFriendRequests':
            actualFieldName = 'allow_friend_requests';
            break;
          case 'preferences.language':
            actualFieldName = 'language';
            break;
          case 'preferences.theme':
            actualFieldName = 'theme';
            break;
          case 'preferences.colorblindMode':
            actualFieldName = 'color_blind_mode';
            break;
          case 'preferences.textSize':
            actualFieldName = 'text_size';
            break;
          default:
            actualFieldName = field;
        }

        return {
          ...prev,
          [actualFieldName]: value
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setProfileData(prev => {
      if (!prev) return null;

      // Gestione corretta per i campi nidificati
      if (name.includes('.')) {
        const [category, field] = name.split('.');

        // Mappa i nomi dei campi dal formato con punto al formato con underscore
        let actualFieldName = '';

        switch (`${category}.${field}`) {
          case 'notifications.email':
            actualFieldName = 'notifications_email';
            break;
          case 'notifications.app':
            actualFieldName = 'notifications_app';
            break;
          case 'notifications.newsletter':
            actualFieldName = 'newsletter';
            break;
          case 'notifications.gameInvites':
            actualFieldName = 'game_invites';
            break;
          case 'notifications.friendRequests':
            actualFieldName = 'friend_requests';
            break;
          case 'privacy.showOnlineStatus':
            actualFieldName = 'show_online_status';
            break;
          case 'privacy.showPlayHistory':
            actualFieldName = 'show_play_history';
            break;
          case 'privacy.allowFriendRequests':
            actualFieldName = 'allow_friend_requests';
            break;
          case 'preferences.colorblindMode':
            actualFieldName = 'color_blind_mode';
            break;
          default:
            actualFieldName = field;
        }

        return {
          ...prev,
          [actualFieldName]: checked
        };
      } else {
        return {
          ...prev,
          [name]: checked
        };
      }
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Seleziona un file immagine valido.');
        e.target.value = '';
        return;
      }
      if (file.size > 180_000) {
        toast.error('L’immagine deve pesare meno di 180 KB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatar(reader.result as string);

          // Aggiorna anche profileData con il nuovo avatar
          setProfileData(prev => {
            if (!prev) return null;
            return {
              ...prev,
              avatar: reader.result as string
            };
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (profileData) {
        const result = await settingsUser(profileData);
        setUser((previous) => previous
          ? { ...previous, ...result.user }
          : result.user);
        setLanguage(normalizeLanguage(result.user.language));
        setDarkMode(result.user.theme === 'dark');
        setSaveSuccess(true);
        toast.success(t.changesSaved);
        window.setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        toast.error('Il profilo non è ancora disponibile.');
      }
    } catch (error) {
      console.error("Errore durante il salvataggio delle impostazioni:", error);
      toast.error(error instanceof Error ? error.message : 'Salvataggio non riuscito.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bv-page">
      <div className="bv-nav-slot">
        <NavBar current={-1} />
      </div>

      <main className="bv-page-with-nav min-h-screen px-4 pb-16 text-[var(--bv-text)]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bv-glass bv-liquid mb-6 rounded-3xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold">{t.profileSettings}</h1>
            <p className="mt-2">{t.manageProfilePreferences}</p>
          </div>

          {/* Settings Content */}
          <div className="bv-glass bv-liquid bv-form overflow-hidden rounded-3xl shadow-lg">
            {/* Tabs */}
            <div className="bv-tabs m-3">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'personal'
                  ? `${darkMode ? 'text-white border-b-2 border-slate-500' : 'text-green-800 border-b-2 border-green-500'}`
                  : `${darkMode ? 'text-slate-400 hover:text-white' : 'text-green-600 hover:text-green-700'}`}`}
              >
                {t.personalData}
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'notifications'
                  ? `${darkMode ? 'text-white border-b-2 border-slate-500' : 'text-green-800 border-b-2 border-green-500'}`
                  : `${darkMode ? 'text-slate-400 hover:text-white' : 'text-green-600 hover:text-green-700'}`}`}
              >
                {t.notifications}
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'privacy'
                  ? `${darkMode ? 'text-white border-b-2 border-slate-500' : 'text-green-800 border-b-2 border-green-500'}`
                  : `${darkMode ? 'text-slate-400 hover:text-white' : 'text-green-600 hover:text-green-700'}`}`}
              >
                {t.privacy}
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'preferences'
                  ? `${darkMode ? 'text-white border-b-2 border-slate-500' : 'text-green-800 border-b-2 border-green-500'}`
                  : `${darkMode ? 'text-slate-400 hover:text-white' : 'text-green-600 hover:text-green-700'}`}`}
              >
                {t.preferences}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Avatar Upload */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={profileData?.avatar || avatar}
                            alt="Profile avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-white' : 'bg-green-100 text-green-700'} rounded-full cursor-pointer hover:${darkMode ? 'bg-slate-600' : 'bg-green-200'} transition-colors text-sm font-medium`}>
                          {t.changeAvatar}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>

                      {/* Personal Info */}
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-green-700'} mb-1`}>
                              {t.fullName}
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={profileData?.name || ''}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                            />
                          </div>

                          <div>
                            <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-green-700'} mb-1`}>
                              {t.username}
                            </label>
                            <input
                              type="text"
                              id="username"
                              name="username"
                              value={profileData?.username || ''}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-green-700'} mb-1`}>
                            {t.email}
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData?.email || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray/50 border-green-200'} rounded-lg outline-none transition-all`}
                            disabled={true}
                          />
                        </div>

                        <div>
                          <label htmlFor="bio" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-green-700'} mb-1`}>
                            {t.bio}
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            value={profileData?.bio || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="location" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-green-700'} mb-1`}>
                              {t.location}
                            </label>
                            <input
                              type="text"
                              id="location"
                              name="location"
                              value={profileData?.location || ''}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                            />
                          </div>

                          <div>
                            <label htmlFor="birthdate" className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-green-700'} mb-1`}>
                              {t.birthdate}
                            </label>
                            <input
                              type="date"
                              id="birthdate"
                              name="birthdate"
                              value={profileData?.birthdate || ''}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-green-800'} mb-4`}>{t.notificationPreferences}</h3>

                    <div className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-green-100'}`}>
                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.emailNotifications}</h4>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.emailNotificationsDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="notifications.email"
                            checked={profileData?.notifications_email || false}
                            onChange={handleCheckboxChange}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                        </label>
                      </div>

                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.appNotifications}</h4>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.appNotificationsDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="notifications.app"
                            checked={profileData?.notifications_app || false}
                            onChange={handleCheckboxChange}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                        </label>
                      </div>

                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.newsletter}</h4>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.newsletterDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="notifications.newsletter"
                            checked={profileData?.newsletter || false}
                            onChange={handleCheckboxChange}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                        </label>
                      </div>

                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.gameInvites}</h4>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.gameInvitesDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="notifications.gameInvites"
                            checked={profileData?.game_invites || false}
                            onChange={handleCheckboxChange}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                        </label>
                      </div>

                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.friendRequests}</h4>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.friendRequestsDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="notifications.friendRequests"
                            checked={profileData?.friend_requests || false}
                            onChange={handleCheckboxChange}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-green-800'} mb-4`}>{t.privacySettings}</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="profileVisibility" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'} mb-1`}>
                          {t.visibilityProfile}
                        </label>
                        <select
                          id="profileVisibility"
                          name="privacy.profileVisibility"
                          value={profileData?.profile_visibility || 'public'}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                        >
                          <option value="public">{t.visibilityPublic}</option>
                          <option value="friends">{t.visibilityFriends}</option>
                          <option value="private">{t.visibilityPrivate}</option>
                        </select>
                      </div>

                      <div className={`${darkMode ? 'divide-slate-700' : 'divide-green-100'} divide-y`}>
                        <div className="py-3 flex items-center justify-between">
                          <div>
                            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.showOnlineStatus}</h4>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.showOnlineStatusDesc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="privacy.showOnlineStatus"
                              checked={profileData?.show_online_status || false}
                              onChange={handleCheckboxChange}
                              className="sr-only peer"
                            />
                            <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                          </label>
                        </div>

                        <div className="py-3 flex items-center justify-between">
                          <div>
                            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.showGameHistory}</h4>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.showGameHistoryDesc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="privacy.showPlayHistory"
                              checked={profileData?.show_play_history || false}
                              onChange={handleCheckboxChange}
                              className="sr-only peer"
                            />
                            <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                          </label>
                        </div>

                        <div className="py-3 flex items-center justify-between">
                          <div>
                            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>{t.allowFriendRequests}</h4>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-green-600'} mt-1`}>{t.allowFriendRequestsDesc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="privacy.allowFriendRequests"
                              checked={profileData?.allow_friend_requests || false}
                              onChange={handleCheckboxChange}
                              className="sr-only peer"
                            />
                            <div className={`w-11 h-6 ${darkMode ? 'bg-slate-600 peer-focus:ring-slate-300' : 'bg-gray-200 peer-focus:ring-green-500'} peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${darkMode ? 'peer-checked:bg-slate-900' : 'peer-checked:bg-green-600'}`}></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Settings */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-green-800'} mb-4`}>{t.appPreferences}</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="language" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'} mb-1`}>
                          {t.language}
                        </label>
                        <select
                          id="language"
                          name="preferences.language"
                          value={profileData?.language || 'it'}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                        >
                          <option value="it">Italiano</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="theme" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'} mb-1`}>
                          {t.theme}
                        </label>
                        <select
                          id="theme"
                          name="preferences.theme"
                          value={profileData?.theme || 'light'}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                        >
                          <option value="light">{t.light}</option>
                          <option value="dark">{t.dark}</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="textSize" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-green-700'} mb-1`}>
                          {t.textSize}
                        </label>
                        <select
                          id="textSize"
                          name="preferences.textSize"
                          value={profileData?.text_size || 'medium'}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600 focus:ring-slate-300' : 'bg-white/50 border-green-200 focus:ring-green-500'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                        >
                          <option value="small">{t.small}</option>
                          <option value="medium">{t.medium}</option>
                          <option value="large">{t.large}</option>
                        </select>
                        <p className="mt-2 text-xs leading-5 text-[var(--bv-muted)]">
                          {t.textSizeDescription || 'Adatta testi e controlli a una lettura più comoda.'}
                        </p>
                      </div>

                      <div className="bv-glass-soft flex items-start justify-between gap-4 rounded-2xl p-4">
                        <div>
                          <label htmlFor="colorBlindMode" className="block text-sm font-bold text-[var(--bv-text)]">
                            {t.colorBlindMode}
                          </label>
                          <p className="mt-1 text-xs leading-5 text-[var(--bv-muted)]">
                            {t.colorBlindModeDesc}
                          </p>
                        </div>
                        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                          <input
                            id="colorBlindMode"
                            type="checkbox"
                            name="preferences.colorblindMode"
                            checked={profileData?.color_blind_mode || false}
                            onChange={handleCheckboxChange}
                            className="peer sr-only"
                          />
                          <span className="h-7 w-12 rounded-full bg-slate-300 transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-sky-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-500/20 dark:bg-slate-700" />
                        </label>
                      </div>

                      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4 text-sm leading-6 text-[var(--bv-muted)]">
                        {t.preferencesApplyHint || 'Tema, lingua, dimensione del testo e palette accessibile vengono applicati subito dopo il salvataggio.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 flex items-center justify-between">
                  {saveSuccess && (
                    <div className={`flex items-center ${darkMode ? 'text-slate-300' : 'text-green-600'}`}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {t.changesSaved}
                    </div>
                  )}

                  <div className="ml-auto">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bv-button-primary group relative px-8"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t.saving}
                        </span>
                      ) : (
                        <span className="relative">
                          {t.saveChanges}
                          <span className="absolute bottom-0 left-0 w-full h-px bg-white transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
