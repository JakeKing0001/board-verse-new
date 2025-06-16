"use client";

import NavBar from "./NavBar";
import { useEffect, useState } from "react";
import { usePieceContext } from "./PieceContext";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

interface GameSummary {
  id: string;
  name: string;
  host_id: number;
  guest_id: number;
  status: string;
  is_private: boolean;
  time: number; // Tempo in secondi
  created_at: string;
}

/**
 * OnlinePage component provides the main interface for the online multiplayer mode.
 * 
 * Features:
 * - Displays recent online games and allows users to join or create new games.
 * - Supports searching for games by list or by ID.
 * - Allows users to configure game settings such as name, time, and privacy.
 * - Uses Supabase for real-time updates and game management.
 * - Handles user authentication and displays appropriate messages if not logged in.
 * - Responsive and styled for both dark and light modes.
 * 
 * State:
 * - showModal: Controls visibility of the modal dialog.
 * - modalType: Determines the type of modal ('search', 'id', or 'create').
 * - modalTab: Tab selection within the search modal.
 * - gameId, gameName: Stores input values for joining/creating games.
 * - gameTime: Total game time in seconds, calculated from days/hours/minutes/seconds.
 * - isPrivate: Whether the game is private.
 * - recentGames: List of recent games fetched from Supabase.
 * - days, hours, minutes, seconds: Used to configure game time.
 * 
 * Effects:
 * - Fetches and subscribes to real-time updates for the games list from Supabase.
 * - Updates gameTime when time fields change.
 * 
 * Handlers:
 * - handleCreateGame: Opens the create game modal.
 * - handleSearchGame: Opens the search game modal.
 * - handleJoinGame: Joins a selected game as a guest.
 * - handleStartGame: Creates a new game and navigates to the chessboard.
 * - validateNumber: Utility to sanitize and limit numeric input fields.
 * 
 * UI:
 * - Animated background, navigation bar, and responsive layout.
 * - Modal dialogs for searching, joining, and creating games.
 * - List of recent games with join buttons.
 * 
 * @component
 */
const OnlinePage = () => {
  const { isLoggedIn, user, t, darkMode } = usePieceContext();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('search'); // 'search', 'id' o 'create'
  const [modalTab, setModalTab] = useState('search'); // 'search' or 'id'
  const [gameId, setGameId] = useState('');
  const [gameName, setGameName] = useState('');
  const [gameTime, setGameTime] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [recentGames, setRecentGames] = useState<GameSummary[]>([]);
  const [days, setDays] = useState('0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('10');
  const [seconds, setSeconds] = useState('0');

  const router = useRouter();

  useEffect(() => {
    supabase
      .from("games")
      .select("id,name,host_id,guest_id,status,is_private,time,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRecentGames(data || []));
  }, []);

  useEffect(() => {
  const channel = supabase
    .channel("realtime-games-list")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "games" },
      (payload) => {
        setRecentGames((prev) => {
          // 1) Se già presente, non la aggiungiamo
          if (prev.some(g => g.id === payload.new.id)) {
            return prev;
          }
          // 2) Altrimenti la prepended normalmente
          return [payload.new as GameSummary, ...prev];
        });
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "games" },
      (payload) => {
        setRecentGames((prev) =>
          prev.map(g =>
            g.id === payload.new.id
              ? (payload.new as GameSummary)
              : g
          )
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  useEffect(() => {
    setGameTime(parseInt(days) * 24 * 60 + parseInt(hours) * 60 + parseInt(minutes) * 60 + parseInt(seconds));
  }, [days, hours, minutes, seconds]);

  const handleCreateGame = () => {
    if (!isLoggedIn) {
      toast.error(t.loginToCreateGame);
      return;
    }
    setModalType('create');
    setShowModal(true);
  };

  const handleSearchGame = () => {
    if (!isLoggedIn) {
      toast.error(t.loginToSearchGame);
      return;
    }
    setModalType('search');
    setModalTab('search');
    setShowModal(true);
  };

  const handleJoinGame = async (g: GameSummary) => {
    if (!user) return toast.error(t.mustBeLogged);
    if (g.status === "waiting" && g.host_id !== user.id) {
      // Unirsi come guest
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error } = await supabase
        .from("games")
        .update({ guest_id: user.id, status: "playing" })
        .eq("id", g.id)
        .select()
        .single();
      if (error) {
        toast.error(t.gameJoinError);
        return;
      }
      router.push(`/chessboard?mode=online&gameId=${g.id}&time=${g.time}`);
    }
  };

  const handleStartGame = async () => {
    if (!gameName.trim()) {
      toast.error(t.insertGameName);
      return;
    }

    if (!user) {
      toast.error(t.loginToCreateGame);
      return;
    }

    const newGame = {
      name: gameName,
      host_id: user.id,
      guest_id: null,
      status: "waiting",
      is_private: isPrivate,
      time: gameTime,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("games").insert([newGame]).select().single();

    if (error) {
      toast.error(t.gameCreateError);
      return;
    }

    setShowModal(false);
    toast.success(`${t.createGameProgress} \"${gameName}\"`);
    // Qui andrebbe la logica per creare effettivamente la partita
    setRecentGames((prev) => [data, ...prev]);
    router.push(`/chessboard?mode=online&gameId=${data.id}&time=${gameTime}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In corso': return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'In attesa': return darkMode ? 'text-amber-400' : 'text-amber-600';
      case 'Completa': return darkMode ? 'text-green-400' : 'text-green-600';
      default: return '';
    }
  };

  const validateNumber = (value: string, max: number) => {
    let num = value.replace(/\D/g, '');
    num = num === '' ? '' : Math.min(parseInt(num), max).toString();
    return num;
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
        <NavBar current={2} />
      </div>

      <div className={`fixed inset-0 flex flex-col items-center ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100 text-green-800'} pt-24 overflow-hidden`}>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-80 h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
          <div className={`absolute top-1/3 right-1/3 w-96 h-96 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700`}></div>
          <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 ${darkMode ? 'bg-slate-800' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000`}></div>
          <div className={`absolute bottom-1/3 right-1/4 w-64 h-64 ${darkMode ? 'bg-slate-700' : 'bg-amber-100'} rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500`}></div>
        </div>

        {/* Main content */}
        <div className="z-10 w-full max-w-5xl px-4 flex flex-col items-center">
          <h1 className="text-5xl font-bold mb-8 tracking-tight">
            {t.onlineMode || "Modalità Online"}
          </h1>

          {/* Game buttons */}
          <div className="flex flex-col sm:flex-row gap-6 mb-10 w-full sm:w-auto justify-center">
            <button
              onClick={handleCreateGame}
              className={`group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white transition-all duration-500 ease-in-out transform ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0`}
            >
              <span className="relative flex items-center">
                <span>{t.createGame || "Crea Partita"}</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </span>
            </button>

            <button
              onClick={handleSearchGame}
              className={`group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white transition-all duration-500 ease-in-out transform ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'} rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0`}
            >
              <span className="relative flex items-center">
                <span>{t.findGame || "Cerca Partita"}</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
            </button>
          </div>

          {/* Recent games list */}
          <div className={`w-full max-w-4xl ${darkMode ? 'bg-slate-800' : 'bg-white/40'} backdrop-blur-md rounded-3xl shadow-2xl p-8 border ${darkMode ? 'border-slate-700' : 'border-white/50'}`}>
            <h2 className="text-2xl font-semibold mb-6">
              {t.recentGames || "Partite Recenti"}
            </h2>

            <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <div
                    key={game.id}
                    className={`p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white/80'} cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg">{game.name}</h3>
                      <div className="flex flex-wrap gap-x-6 text-sm mt-1">
                        <span>{t.players || "Giocatori"}: {game.host_id}</span>
                        <span className={getStatusColor(game.status)}>{game.status}</span>
                        <span className="opacity-75">{game.created_at}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinGame(game)}
                      className={`px-4 py-2 rounded-full text-white text-sm font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} transition-colors`}
                    >
                      {t.joinGame || "Partecipa"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`relative max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-green-800'}`}>
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 p-1 rounded-full ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Search Game Modal */}
            {modalType === 'search' && (
              <>
                <h3 className="text-2xl font-bold mb-6">{t.findGame || "Cerca Partita"}</h3>

                {/* Tab buttons */}
                <div className="flex mb-6 border-b">
                  <button
                    className={`flex-1 pb-3 font-medium ${modalTab === 'search' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
                    onClick={() => setModalTab('search')}
                  >
                    {t.searchGame || "Cerca Partita"}
                  </button>
                  <button
                    className={`flex-1 pb-3 font-medium ${modalTab === 'id' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
                    onClick={() => setModalTab('id')}
                  >
                    {t.joinById || "Cerca tramite ID"}
                  </button>
                </div>

                {/* Tab content */}
                {modalTab === 'search' ? (
                  <div className="space-y-4">
                    <p>{t.searchGameDescription || "Cerca una partita disponibile tra quelle attualmente in attesa di giocatori."}</p>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-green-50'}`}>
                      <div className="flex justify-between items-center">
                        <span>{t.searchingGame || "Ricerca di partite..."}</span>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-current"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>{t.enterGameId || "Inserisci l'ID della partita a cui vuoi unirti:"}</p>
                    <input
                      type="text"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      placeholder={t.gameIdExample}
                      className={`w-full px-4 py-3 rounded-lg focus:outline-none ${darkMode ? 'bg-slate-700 focus:ring-1 focus:ring-blue-500' : 'bg-green-50 focus:ring-1 focus:ring-green-500'}`}
                    />
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={async () => {
                      const game = recentGames.find(game => game.id === gameId);
                      if (game) {
                        await handleJoinGame(game);
                      } else {
                        toast.error(t.gameNotFound);
                      }
                    }}
                    className={`px-6 py-2 rounded-full font-medium text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} transition-colors`}
                  >
                    {t.joinGame || "Partecipa"}
                  </button>
                </div>
              </>
            )}

            {/* Create Game Modal */}
            {modalType === 'create' && (
              <>
                <h3 className="text-2xl font-bold mb-6">{t.createGame || "Crea Partita"}</h3>

                <div className="space-y-5">
                  <div>
                    <label className="block mb-2 font-medium">{t.gameName || "Nome della partita"}:</label>
                    <input
                      type="text"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder={t.gameNamePlaceholder || "Inserisci un nome..."}
                      className={`w-full px-4 py-3 rounded-lg focus:outline-none ${darkMode ? 'bg-slate-700 focus:ring-1 focus:ring-blue-500' : 'bg-green-50 focus:ring-1 focus:ring-green-500'}`}
                    />
                  </div>

                  {/* <div>
                    <label className="block mb-2 font-medium">{t.maxPlayers || "Numero massimo di giocatori"}:</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="2" 
                        max="8" 
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                        className={`flex-grow h-2 rounded-lg appearance-none ${darkMode ? 'bg-slate-600' : 'bg-green-200'} cursor-pointer`}
                      />
                      <span className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-green-600'}`}>{maxPlayers}</span>
                    </div>
                  </div> */}

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-600'}`}>
                        {t.gameTime || "Tempo di gioco"}:
                      </h3>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className={`block text-sm ${darkMode ? 'text-white' : 'text-gray-600 mb-1'}`}>
                          {t.days || "Giorni"}
                        </label>
                        <input
                          type="text"
                          value={days}
                          onChange={(e) => setDays(validateNumber(e.target.value, 99))}
                          className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-white bg-slate-800 text-white' : 'focus:ring-green-500'}`}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${darkMode ? 'text-white' : 'text-gray-600 mb-1'}`}>
                          {t.hours || "Ore"}
                        </label>
                        <input
                          type="text"
                          value={hours}
                          onChange={(e) => setHours(validateNumber(e.target.value, 23))}
                          className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-white bg-slate-800 text-white' : 'focus:ring-green-500'}`}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${darkMode ? 'text-white' : 'text-gray-600 mb-1'}`}>
                          {t.minutes || "Minuti"}
                        </label>
                        <input
                          type="text"
                          value={minutes}
                          onChange={(e) => setMinutes(validateNumber(e.target.value, 59))}
                          className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-white bg-slate-800 text-white' : 'focus:ring-green-500'}`}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm ${darkMode ? 'text-white' : 'text-gray-600 mb-1'}`}>
                          {t.seconds || "Secondi"}
                        </label>
                        <input
                          type="text"
                          value={seconds}
                          onChange={(e) => setSeconds(validateNumber(e.target.value, 59))}
                          className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-white bg-slate-800 text-white' : 'focus:ring-green-500'}`}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="private-game"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                    <label htmlFor="private-game" className="ml-2 cursor-pointer">
                      {t.privateGame || "Partita privata (solo su invito)"}
                    </label>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-green-50'}`}>
                    <p className="font-medium">{t.gameDetails || "Dettagli partita"}:</p>
                    <ul className="mt-2 space-y-1 text-sm opacity-80">
                      <li>• {t.gameId || "ID Partita"}: <span className="opacity-70">{t.generatedAfterCreation || "Generato dopo la creazione"}</span></li>
                      <li>• {t.host || "Host"}: {user?.email || t.you || "Tu"}</li>
                      <li>• {t.mode || "Modalità"}: {t.standard || "Standard"}</li>
                      <li>• {t.gameDuration || "Durata"}: {gameTime} {t.seconds || "secondi"}</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className={`px-6 py-2 rounded-full font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-green-800 hover:bg-green-50'}`}
                  >
                    {t.cancel || "Annulla"}
                  </button>
                  <button
                    onClick={handleStartGame}
                    className={`px-6 py-2 rounded-full font-medium text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} transition-colors`}
                  >
                    {t.createAndStart || "Crea e Avvia"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OnlinePage;