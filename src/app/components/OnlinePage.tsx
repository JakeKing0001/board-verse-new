"use client";

import NavBar from "./NavBar";
import { useEffect, useState } from "react";
import { usePieceContext } from "./PieceContext";
import toast from "react-hot-toast";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { createGame, getRecentGames, joinGame } from "../../../services/games";
import type { GameCursor, GameSummary } from "../../types/domain";
import { Globe2, Plus, Search, X } from "lucide-react";

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
  const [gameTime, setGameTime] = useState(600);
  const [isPrivate, setIsPrivate] = useState(false);
  const [recentGames, setRecentGames] = useState<GameSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<GameCursor | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [createdGame, setCreatedGame] = useState<GameSummary | null>(null);
  const [days, setDays] = useState('0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('10');
  const [seconds, setSeconds] = useState('0');

  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      setRecentGames([]);
      setNextCursor(null);
      return;
    }

    let active = true;
    setIsLoadingGames(true);
    getRecentGames()
      .then(({ games, nextCursor: cursor }) => {
        if (!active) return;
        setRecentGames(games);
        setNextCursor(cursor);
      })
      .catch(() => {
        if (active) toast.error(t.gameSearchError || "Impossibile caricare le partite.");
      })
      .finally(() => {
        if (active) setIsLoadingGames(false);
      });

    return () => {
      active = false;
    };
  }, [isLoggedIn, t.gameSearchError]);

  useEffect(() => {
  if (!isLoggedIn) return;

  const channel = supabase
    .channel("realtime-games-list")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "games" },
      (payload) => {
        if (payload.new.is_private || payload.new.status !== 'waiting') return;
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
        setRecentGames((prev) => {
          if (payload.new.is_private || payload.new.status !== 'waiting') {
            return prev.filter((game) => game.id !== payload.new.id);
          }
          return prev.map((game) =>
            game.id === payload.new.id ? (payload.new as GameSummary) : game
          );
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isLoggedIn]);

  useEffect(() => {
    setGameTime(parseInt(days) * 24 * 60 * 60 + parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds));
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
      try {
        const joinedGame = await joinGame({ gameId: g.id });
        router.push(`/chessboard?mode=online&gameId=${joinedGame.id}&time=${joinedGame.time}`);
      } catch {
        toast.error(t.gameJoinError);
      }
    }
  };

  const handleJoinByCode = async () => {
    const value = gameId.trim();
    if (!value) {
      toast.error(t.gameNotFound);
      return;
    }

    try {
      const joinedGame = await joinGame({ joinCode: value });
      setShowModal(false);
      router.push(`/chessboard?mode=online&gameId=${joinedGame.id}&time=${joinedGame.time}`);
    } catch {
      toast.error(t.gameJoinError);
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
    if (!Number.isInteger(gameTime) || gameTime < 30) {
      toast.error(t.invalidGameTime || "Imposta una durata di almeno 30 secondi.");
      return;
    }

    try {
      const data = await createGame({
        name: gameName,
        time: gameTime,
        isPrivate,
      });

      setRecentGames((prev) => isPrivate ? prev : [data, ...prev]);
      if (isPrivate) {
        setCreatedGame(data);
        setModalType('created');
        toast.success(t.gameCreated || "Partita privata creata.");
        return;
      }

      setShowModal(false);
      toast.success(`${t.createGameProgress} "${gameName}"`);
      router.push(`/chessboard?mode=online&gameId=${data.id}&time=${gameTime}`);
    } catch {
      toast.error(t.gameCreateError);
    }
  };

  const loadMoreGames = async () => {
    if (!nextCursor || isLoadingGames) return;
    setIsLoadingGames(true);
    try {
      const page = await getRecentGames(nextCursor);
      setRecentGames((previous) => {
        const known = new Set(previous.map((game) => game.id));
        return [...previous, ...page.games.filter((game) => !known.has(game.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      toast.error(t.gameSearchError || "Impossibile caricare altre partite.");
    } finally {
      setIsLoadingGames(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'playing': return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'waiting': return darkMode ? 'text-amber-400' : 'text-amber-600';
      case 'complete': return darkMode ? 'text-green-400' : 'text-green-600';
      default: return '';
    }
  };

  const validateNumber = (value: string, max: number) => {
    let num = value.replace(/\D/g, '');
    num = num === '' ? '' : Math.min(parseInt(num), max).toString();
    return num;
  };

  return (
    <div className="bv-page">
      <div className="bv-nav-slot">
        <NavBar current={1} />
      </div>

      <main className="bv-page-with-nav relative flex min-h-screen flex-col items-center overflow-y-auto pb-12 text-[var(--bv-text)]">

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-80 h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
          <div className={`absolute top-1/3 right-1/3 w-96 h-96 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700`}></div>
          <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 ${darkMode ? 'bg-slate-800' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000`}></div>
          <div className={`absolute bottom-1/3 right-1/4 w-64 h-64 ${darkMode ? 'bg-slate-700' : 'bg-amber-100'} rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500`}></div>
        </div>

        {/* Main content */}
        <div className="z-10 flex w-full max-w-5xl flex-col items-center px-4 py-10 sm:py-14">
          <span className="bv-eyebrow">
            <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
            Live multiplayer
          </span>
          <h1 className="mt-5 text-center text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            {t.onlineMode || "Modalità Online"}
          </h1>

          {/* Game buttons */}
          <div className="mb-10 mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={handleCreateGame}
              className="bv-button-primary group px-8 text-base sm:text-lg"
            >
              <span className="relative flex items-center">
                <Plus aria-hidden="true" className="mr-2 h-5 w-5" />
                <span>{t.createGame || "Crea Partita"}</span>
              </span>
            </button>

            <button
              onClick={handleSearchGame}
              className="bv-button-secondary group px-8 text-base sm:text-lg"
            >
              <span className="relative flex items-center">
                <Search aria-hidden="true" className="mr-2 h-5 w-5 text-violet-500" />
                <span>{t.findGame || "Cerca Partita"}</span>
              </span>
            </button>
          </div>

          {/* Recent games list */}
          <div className={`bv-glass bv-liquid w-full max-w-4xl rounded-3xl border p-5 shadow-2xl sm:p-8 ${darkMode ? 'border-slate-700' : 'border-white/50'}`}>
            <h2 className="text-2xl font-semibold mb-6">
              {t.recentGames || "Partite Recenti"}
            </h2>

            <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <div
                    key={game.id}
                    className={`bv-glass-soft flex flex-col justify-between gap-3 rounded-2xl p-4 transition-all duration-300 sm:flex-row sm:items-center ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white/80'}`}
                  >
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg">{game.name}</h3>
                      <div className="flex flex-wrap gap-x-6 text-sm mt-1">
                        <span>{t.players || "Giocatori"}: {game.host_id}</span>
                        <span className={getStatusColor(game.status)}>{game.status}</span>
                        {game.status === 'complete' && (
                          <span>{game.result}</span>
                        )}
                        <span className="opacity-75">
                          {new Intl.DateTimeFormat(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          }).format(new Date(game.created_at))}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJoinGame(game)}
                      disabled={game.status !== 'waiting' || game.host_id === user?.id}
                      className={`px-4 py-2 rounded-full text-white text-sm font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} transition-colors disabled:opacity-50`}
                    >
                      {t.joinGame || "Partecipa"}
                    </button>
                  </div>
                ))}
                {!isLoadingGames && recentGames.length === 0 && (
                  <p className="rounded-xl border border-dashed border-current/20 p-8 text-center opacity-75">
                    {t.noGamesAvailable || "Nessuna partita pubblica disponibile al momento."}
                  </p>
                )}
              </div>
              {nextCursor && (
                <button
                  type="button"
                  onClick={loadMoreGames}
                  disabled={isLoadingGames}
                  className={`mx-auto mt-5 block rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-green-50'}`}
                >
                  {isLoadingGames ? (t.loading || "Caricamento...") : (t.loadMore || "Carica altre")}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <div className="bv-modal-backdrop fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="online-modal-title"
            className={`bv-glass-strong bv-liquid relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-3xl border p-5 shadow-2xl sm:p-8 ${darkMode ? 'border-slate-700 text-white' : 'border-white/80 text-green-900'}`}
          >
            <button
              type="button"
              aria-label={t.close || "Chiudi"}
              onClick={() => setShowModal(false)}
              className={`absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>

            {/* Search Game Modal */}
            {modalType === 'search' && (
              <>
                <h3 id="online-modal-title" className="text-2xl font-bold mb-6">{t.findGame || "Cerca Partita"}</h3>

                {/* Tab buttons */}
                <div className="bv-tabs mb-6">
                  <button
                    type="button"
                    className={`flex-1 pb-3 font-medium ${modalTab === 'search' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
                    onClick={() => setModalTab('search')}
                  >
                    {t.searchGame || "Cerca Partita"}
                  </button>
                  <button
                    type="button"
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
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {recentGames.slice(0, 8).map((game) => (
                        <button
                          type="button"
                          key={game.id}
                          onClick={() => handleJoinGame(game)}
                          className={`flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-green-50 hover:bg-green-100'}`}
                        >
                          <span className="min-w-0">
                            <strong className="block truncate">{game.name}</strong>
                            <span className="text-xs opacity-65">
                              #{game.id} · {Math.max(1, Math.round(game.time / 60))} min
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-bold">
                            {t.joinGame || "Partecipa"}
                          </span>
                        </button>
                      ))}
                      {!isLoadingGames && recentGames.length === 0 && (
                        <p className={`rounded-2xl border border-dashed p-5 text-center text-sm ${darkMode ? 'border-slate-700' : 'border-green-200'}`}>
                          {t.noGamesAvailable || "Nessuna partita pubblica disponibile al momento."}
                        </p>
                      )}
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
                      className="bv-input"
                    />
                  </div>
                )}

                {modalTab === 'id' && (
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={handleJoinByCode}
                      className={`px-6 py-2 rounded-full font-medium text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} transition-colors`}
                    >
                      {t.joinGame || "Partecipa"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Create Game Modal */}
            {modalType === 'create' && (
              <>
                <h3 id="online-modal-title" className="text-2xl font-bold mb-6">{t.createGame || "Crea Partita"}</h3>

                <div className="space-y-5">
                  <div>
                    <label className="block mb-2 font-medium">{t.gameName || "Nome della partita"}:</label>
                    <input
                      type="text"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder={t.gameNamePlaceholder || "Inserisci un nome..."}
                      className="bv-input"
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

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <label className={`block text-sm ${darkMode ? 'text-white' : 'text-gray-600 mb-1'}`}>
                          {t.days || "Giorni"}
                        </label>
                        <input
                          type="text"
                          value={days}
                          onChange={(e) => setDays(validateNumber(e.target.value, 99))}
                          className="bv-input text-center"
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
                          className="bv-input text-center"
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
                          className="bv-input text-center"
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
                          className="bv-input text-center"
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
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-6 py-2 rounded-full font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-green-800 hover:bg-green-50'}`}
                  >
                    {t.cancel || "Annulla"}
                  </button>
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className={`px-6 py-2 rounded-full font-medium text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} transition-colors`}
                  >
                    {t.createAndStart || "Crea e Avvia"}
                  </button>
                </div>
              </>
            )}

            {modalType === 'created' && createdGame && (
              <>
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${darkMode ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                  <span aria-hidden="true" className="text-2xl">✓</span>
                </div>
                <h3 id="online-modal-title" className="text-2xl font-bold">
                  {t.gameCreated || "Partita privata creata"}
                </h3>
                <p className="mt-2 opacity-75">
                  {t.shareInviteCode || "Condividi questo codice con la persona che vuoi invitare."}
                </p>
                <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-emerald-200 bg-emerald-50'}`}>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-60">
                    {t.inviteCode || "Codice invito"}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <code className="min-w-0 flex-1 break-all text-sm font-semibold">
                      {createdGame.join_code}
                    </code>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!createdGame.join_code) return;
                        await navigator.clipboard.writeText(createdGame.join_code);
                        toast.success(t.codeCopied || "Codice copiato.");
                      }}
                      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-bold ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-emerald-100'}`}
                    >
                      {t.copy || "Copia"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/chessboard?mode=online&gameId=${createdGame.id}&time=${createdGame.time}`)}
                  className={`mt-6 w-full rounded-full px-6 py-3 font-bold text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}
                >
                  {t.goToBoard || "Vai alla scacchiera"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlinePage;
