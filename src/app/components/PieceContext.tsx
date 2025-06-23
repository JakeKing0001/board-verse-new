"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { debugLog } from '../../../lib/debug';
import { getUsers } from '../../../services/login';
import { getChallenge } from '../../../services/challenge';
import { getChallengeComplete } from '../../../services/challengeComplete';
import { getRequests } from '../../../services/friends';
import { getFriends } from '../../../services/friends';
import jwt from 'jsonwebtoken';
import en from '../../../public/locales/en.json'
import it from '../../../public/locales/it.json'
import es from '../../../public/locales/es.json'
import fr from '../../../public/locales/fr.json'
import de from '../../../public/locales/de.json'

const PieceContext = createContext<{
    activePiece: string | null;
    setActivePiece: (piece: string | null) => void;
    activeClass: string;
    hoverPiece: string | null;
    setHoverPiece: (piece: string | null) => void;
    isWhite: boolean;
    setIsWhite: (value: boolean) => void;
    time: number;
    setTime: (value: number) => void;
    mode: string;
    setMode: (value: string) => void;
    isGameOver: string;
    setIsGameOver: (value: string) => void;
    selectedPiece: string | null;
    setSelectedPiece: (piece: string | null) => void;
    subMovesDrag: string;
    setsubMovesDrag: (moves: string) => void;
    isLoggedIn: string; // Token di login dell'utente
    setIsLoggedIn: (value: string) => void; // Funzione per aggiornare lo stato di login
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setUser: (user: any) => void;
    language: string;
    setLanguage: (language: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setT: (translation: any) => void;
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    challenges: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChallenges: (challenges: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    completedChallenges: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCompletedChallenges: (completedChallenges: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requests: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setRequests_: (requests: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    friends: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFriends_: (friends: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allUsers: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setAllUsers: (users: any[]) => void;
} | null>(null);

/**
 * Provides a context for managing the state of chess pieces, user information, challenges, friends, and UI preferences
 * throughout the application. This context includes state and setters for the currently active piece, user authentication,
 * language and theme preferences, challenges, friend requests, and more.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components that will have access to the context.
 *
 * @returns {JSX.Element} The context provider wrapping its children.
 *
 * @context
 * - `activePiece`, `setActivePiece`: Currently active chess piece and its setter.
 * - `activeClass`: CSS class for the active piece.
 * - `isWhite`, `setIsWhite`: Boolean and setter indicating if the current player is white.
 * - `hoverPiece`, `setHoverPiece`: Currently hovered piece and its setter.
 * - `time`, `setTime`: Game time and its setter.
 * - `mode`, `setMode`: Current game mode and its setter.
 * - `isGameOver`, `setIsGameOver`: Game over state and its setter.
 * - `selectedPiece`, `setSelectedPiece`: Currently selected piece and its setter.
 * - `subMovesDrag`, `setsubMovesDrag`: Sub-moves during drag and its setter.
 * - `isLoggedIn`, `setIsLoggedIn`: Logged-in user's token and its setter.
 * - `user`, `setUser`: Current user object and its setter.
 * - `allUsers`, `setAllUsers`: List of all users and its setter.
 * - `language`, `setLanguage`: Current language and its setter.
 * - `t`, `setT`: Current translation object and its setter.
 * - `darkMode`, `setDarkMode`: Dark mode state and its setter.
 * - `challenges`, `setChallenges`: List of challenges and its setter.
 * - `completedChallenges`, `setCompletedChallenges`: List of completed challenges and its setter.
 * - `requests`, `setRequests_`: List of friend requests and its setter.
 * - `friends`, `setFriends_`: List of friends and its setter.
 *
 * @example
 * 
 * <PieceProvider>
 *   <YourComponent />
 * </PieceProvider>
 * 
 */
export const PieceProvider = ({ children }: { children: ReactNode }) => {

    const [activePiece, setActivePiece] = useState<string | null>(null);

    const [isWhite, setIsWhite] = useState<boolean>(true);

    const [hoverPiece, setHoverPiece] = useState<string | null>(null);

    const [time, setTime] = useState<number>(0);

    const [mode, setMode] = useState<string>('');

    const [isGameOver, setIsGameOver] = useState<string>('');

    const [isLoggedIn, setIsLoggedIn] = useState<string>(''); // Token di autenticazione dell'utente

    const [selectedPiece, setSelectedPiece] = useState<string | null>(null); // Stato del pezzo attivo

    const [subMovesDrag, setsubMovesDrag] = useState<string>('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null); // Stato dell'utente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [allUsers, setAllUsers] = useState<any[]>([]); // Stato per memorizzare tutti gli utenti
    const [language, setLanguage] = useState<string>('en'); // Stato della lingua
    const [t, setT] = useState(en); // Traduzione corrente
    const [darkMode, setDarkMode] = useState(false); // Stato della modalità scura
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [challenges, setChallenges] = useState<any[]>([]); // Stato per memorizzare le sfide
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [completedChallenges, setCompletedChallenges] = useState<any[]>([]); // Stato per memorizzare le sfide completate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [requests, setRequests_] = useState<any[]>([]); // Stato per memorizzare le richieste di amicizia
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [friends, setFriends_] = useState<any[]>([]); // Stato per memorizzare gli amici

    const activeClass = 'scale-[1.15] bg-[#ffff33] opacity-50 rounded-full';

    useEffect(() => {
        // Recupera il token salvato
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        setIsLoggedIn(storedToken);
    }, []);

    useEffect(() => {
        // Fetch generale dell'utente e dei suoi dati associati
        const fetchUserData = async () => {
            if (!isLoggedIn) {
                setUser(null);
                return;
            }

            let payload: { id: number; email: string } | null = null;
            try {
                payload = jwt.decode(isLoggedIn) as { id: number; email: string } | null;
            } catch (err) {
                console.error('Invalid token:', err);
            }

            if (!payload) {
                setUser(null);
                return;
            }

            try {
                const [users, completed, friendRequests, friends] = await Promise.all([
                    getUsers(),
                    getChallengeComplete(),
                    getRequests(),
                    getFriends(),
                ]);

                setAllUsers(users);
                debugLog('All users:', allUsers);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const foundUser = users.find((u: any) => u.id === payload?.id);
                if (!foundUser) return;

                setUser(foundUser);
                debugLog('Found user:', foundUser);

                // Imposta lingua
                const userLanguage = foundUser.language || 'en';
                setLanguage(userLanguage);

                switch (userLanguage) {
                    case 'it': setT(it); break;
                    case 'es': setT(es); break;
                    case 'fr': setT(fr); break;
                    case 'de': setT(de); break;
                    default: setT(en);
                }

                // Imposta tema
                const userDarkMode = foundUser.theme || 'light';
                setDarkMode(userDarkMode === 'dark');

                // Sfide completate
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const userCompleted = completed.filter((c: any) => c.user_id === foundUser.id);
                setCompletedChallenges(userCompleted);

                // Richieste amicizia
                const pending = formatFriendRequests(friendRequests, foundUser, users, t);
                setRequests_(pending);

                // Amici
                const friendsList = formatFriendsList(friends, foundUser.id, users);
                setFriends_(friendsList);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
            }
        };

        fetchUserData();
    }, [isLoggedIn]);

    // Update last seen periodically and on unload
    useEffect(() => {
        if (!user) return;

        const update = async () => {
            try {
                const { updateLastSeen } = await import('../../../services/lastSeen');
                await updateLastSeen({ userID: user.id });
            } catch (err) {
                console.error('Failed to update last seen:', err);
            }
        };

        const handleUnload = () => { void update(); };
        window.addEventListener('beforeunload', handleUnload);
        const interval = setInterval(update, 60000);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            clearInterval(interval);
        };
    }, [user]);

    useEffect(() => {
        // Sfide generali (non collegate all'utente)
        const fetchChallenges = async () => {
            try {
                const challenges = await getChallenge();
                setChallenges(challenges);
            } catch (err) {
                console.error("Errore nel get delle sfide:", err);
            }
        };

        fetchChallenges();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function formatFriendRequests(friendRequests: any[], user: any, users: any[], t: any) {
        return friendRequests
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((req: any) => req.receiver_id === user.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((req: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sender = users.find((u: any) => u.id === req.sender_id);
                if (!sender) return undefined;

                const sentAt = new Date(req.sent_at);
                const now = new Date();
                const diffMs = now.getTime() - sentAt.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                let requestDate = '';
                if (diffDays === 0) requestDate = t.today || "Today";
                else if (diffDays === 1) requestDate = t.yesterday || "Yesterday";
                else requestDate = `${diffDays} ${t.daysAgo || "days ago"}`;

                return {
                    id: req.id,
                    sender_id: req.sender_id,
                    receiver_id: req.receiver_id,
                    username: sender.username,
                    email: sender.email,
                    avatar: sender.avatar,
                    requestDate,
                };
            })
            .filter((x): x is NonNullable<typeof x> => !!x);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function formatFriendsList(friends: any[], userId: number, users: any[]) {
        return friends
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((friend: any) =>
                friend.user_id === userId || friend.friend_id === userId
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((friend: any) => {
                const friendUserId = friend.user_id === userId ? friend.friend_id : friend.user_id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const friendUser = users.find((u: any) => u.id === friendUserId);
                if (!friendUser) return undefined;
                return {
                    id: friend.id,
                    user_id: friend.user_id,
                    friend_id: friend.friend_id,
                    username: friendUser.username,
                    email: friendUser.email,
                    avatar: friendUser.avatar,
                    status: friendUser.status,
                    lastSeen: friendUser.last_seen,
                };
            })
            .filter((x): x is NonNullable<typeof x> => !!x);
    }



    return (
        <PieceContext.Provider value={{
            activePiece,
            setActivePiece,
            activeClass,
            isWhite,
            setIsWhite,
            hoverPiece,
            setHoverPiece,
            time,
            setTime,
            mode,
            setMode,
            isGameOver,
            setIsGameOver,
            selectedPiece,
            setSelectedPiece,
            subMovesDrag,
            setsubMovesDrag,
            isLoggedIn,
            setIsLoggedIn,
            user,
            setUser,
            language,
            setLanguage,
            t,
            setT,
            darkMode,
            setDarkMode,
            challenges,
            setChallenges,
            completedChallenges,
            setCompletedChallenges,
            requests,
            setRequests_,
            friends,
            setFriends_,
            allUsers,
            setAllUsers,
        }}>
            {children}
        </PieceContext.Provider>
    );
};

export const usePieceContext = () => {
    const context = useContext(PieceContext);
    if (!context) {
        throw new Error('usePieceContext deve essere utilizzato all\'interno di un PieceProvider');
    }
    return context;
};
