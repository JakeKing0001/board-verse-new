"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getUsers } from '../../../services/login';
import { getChallenge } from '../../../services/challenge';
import { getChallengeComplete } from '../../../services/challengeComplete';
import { getRequests } from '../../../services/friends';
import { getFriends } from '../../../services/friends';
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
    isLoggedIn: string; // Stato di login dell'utente
    setIsLoggedIn: (value: string) => void; // Funzione per aggiornare lo stato di login
    user: any;
    setUser: (user: any) => void;
    language: string;
    setLanguage: (language: string) => void;
    t: any;
    setT: (translation: any) => void;
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    challenges: any[];
    setChallenges: (challenges: any[]) => void;
    completedChallenges: any[];
    setCompletedChallenges: (completedChallenges: any[]) => void;
    requests: any[];
    setRequests_: (requests: any[]) => void;
    friends: any[];
    setFriends_: (friends: any[]) => void;
    allUsers: any[];
    setAllUsers: (users: any[]) => void;
} | null>(null);

export const PieceProvider = ({ children }: { children: ReactNode }) => {

    const [activePiece, setActivePiece] = useState<string | null>(null);

    const [isWhite, setIsWhite] = useState<boolean>(true);

    const [hoverPiece, setHoverPiece] = useState<string | null>(null);

    const [time, setTime] = useState<number>(0);

    const [mode, setMode] = useState<string>('');

    const [isGameOver, setIsGameOver] = useState<string>('');

    const [isLoggedIn, setIsLoggedIn] = useState<string>(''); // Email dell'utente

    const [selectedPiece, setSelectedPiece] = useState<string | null>(null); // Stato del pezzo attivo

    const [subMovesDrag, setsubMovesDrag] = useState<string>('');

    const [user, setUser] = useState<any>(null); // Stato dell'utente
    const [allUsers, setAllUsers] = useState<any[]>([]); // Stato per memorizzare tutti gli utenti
    const [language, setLanguage] = useState<string>('en'); // Stato della lingua
    const [t, setT] = useState(en); // Traduzione corrente
    const [darkMode, setDarkMode] = useState(false); // Stato della modalità scura
    const [challenges, setChallenges] = useState<any[]>([]); // Stato per memorizzare le sfide
    const [completedChallenges, setCompletedChallenges] = useState<any[]>([]); // Stato per memorizzare le sfide completate
    const [requests, setRequests_] = useState<any[]>([]); // Stato per memorizzare le richieste di amicizia
    const [friends, setFriends_] = useState<any[]>([]); // Stato per memorizzare gli amici

    const activeClass = 'scale-[1.15] bg-[#ffff33] opacity-50 rounded-full';

    useEffect(() => {
        // Recupera login salvato
        const storedLogin = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn') || '';
        setIsLoggedIn(storedLogin);
    }, []);

    // useEffect(() => {
    //     // Salva il login corrente in base a rememberMe
    //     if (isLoggedIn) {
    //         if (localStorage.getItem('rememberMe') === "true") {
    //             localStorage.setItem('isLoggedIn', isLoggedIn);
    //         } else {
    //             sessionStorage.setItem('isLoggedIn', isLoggedIn);
    //         }
    //     } else {
    //         localStorage.removeItem('isLoggedIn');
    //         sessionStorage.removeItem('isLoggedIn');
    //     }
    // }, [isLoggedIn]);

    useEffect(() => {
        // Fetch generale dell'utente e dei suoi dati associati
        const fetchUserData = async () => {
            if (!isLoggedIn) {
                setUser(null);
                return;
            }

            const users = await getUsers();
            setAllUsers(users);
            console.log("All users:", allUsers)

            const foundUser = users.find((u: any) => u.email === isLoggedIn);
            if (!foundUser) return;

            setUser(foundUser);
            console.log("Found user:", foundUser);

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
            const completed = await getChallengeComplete();
            const userCompleted = completed.filter((c: any) => c.user_id === foundUser.id);
            setCompletedChallenges(userCompleted);

            // Richieste amicizia
            const friendRequests = await getRequests();
            const pending = formatFriendRequests(friendRequests, foundUser, users, t);
            setRequests_(pending);

            // Amici
            const friends = await getFriends();
            const friendsList = formatFriendsList(friends, foundUser.id, users);
            setFriends_(friendsList);
        };

        fetchUserData();
    }, [isLoggedIn]);

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

    function formatFriendRequests(friendRequests: any[], user: any, users: any[], t: any) {
        return friendRequests
            .filter((req: any) => req.receiver_id === user.id)
            .map((req: any) => {
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

    function formatFriendsList(friends: any[], userId: number, users: any[]) {
        return friends
            .filter((friend: any) =>
                friend.user_id === userId || friend.friend_id === userId
            )
            .map((friend: any) => {
                const friendUserId = friend.user_id === userId ? friend.friend_id : friend.user_id;
                const friendUser = users.find((u: any) => u.id === friendUserId);
                if (!friendUser) return undefined;
                return {
                    id: friend.id,
                    user_id: friend.user_id,
                    friend_id: friend.friend_id,
                    username: friendUser.username,
                    email: friendUser.email,
                    avatar: friendUser.avatar,
                    status: friend.status,
                    lastSeen: friend.last_seen,
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
