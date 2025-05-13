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
        const storedLogin = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn') || '';
        setIsLoggedIn(storedLogin);
    }, []);

    useEffect(() => {
        // Ogni volta che cambia, salvalo
        if (isLoggedIn) {
            if (localStorage.getItem('rememberMe') === "true") {
                localStorage.setItem('isLoggedIn', isLoggedIn);
            } else {
                sessionStorage.setItem('isLoggedIn', isLoggedIn);
            }
        } else {
            localStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('isLoggedIn');
        }
    }, [isLoggedIn]);

    useEffect(() => {
        // Quando isLoggedIn (email) cambia, recupera l'intero utente
        const fetchUser = async () => {
            if (isLoggedIn) {
                const users = await getUsers();
                setAllUsers(users); // Salva tutti gli utenti nello stato
                console.log('users', users);
                const foundUser = users.find((u: any) => u.email === isLoggedIn);
                console.log('foundUser', foundUser);
                setUser(foundUser || null);
                const userLanguage = foundUser.language || 'en'; // Imposta la lingua dell'utente
                setLanguage(userLanguage);
                const userDarkMode = foundUser.theme || 'light'; // Imposta la lingua dell'utente
                setDarkMode(userDarkMode === 'dark' ? true : false); // Imposta la lingua dell'utente

                if (userLanguage === 'it') {
                    setT(it);
                } else if (userLanguage === 'es') {
                    setT(es);
                } else if (userLanguage === 'fr') {
                    setT(fr);
                } else if (userLanguage === 'de') {
                    setT(de);
                } else {
                    setT(en);
                }

                const completed = await getChallengeComplete(); // Ottieni le sfide completate
                const loggedCompleted = (completed && completed.filter((challenge: { user_id: number }) => challenge.user_id === foundUser.id)); // Stampa le sfide completate
                setCompletedChallenges(loggedCompleted); // Filtra le sfide completate per l'utente

                // Fetch pending friend requests (senza un altro useEffect)
                const friendRequests = await getRequests();

                // Filter requests where the current user is the receiver
                const requestsArray = Array.isArray(friendRequests) ? friendRequests : [];
                const pending = requestsArray
                    .filter((req: any) => req.receiver_id === foundUser.id)
                    .map((req: any) => {
                        const sender = users.find((u: any) => u.id === req.sender_id);
                        if (!sender) return undefined;
                        // Calcola i giorni fa in modo leggibile
                        const sentAt = new Date(req.sent_at);
                        const now = new Date();
                        const diffMs = now.getTime() - sentAt.getTime();
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        let requestDate = '';
                        if (diffDays === 0) {
                            requestDate = t.today || "Today";
                        } else if (diffDays === 1) {
                            requestDate = t.yesterday || "Yesterday";
                        } else {
                            requestDate = `${diffDays} ${t.daysAgo || "days ago"}`;
                        }
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
                    .filter((x): x is { id: number; sender_id: number; receiver_id: number; username: string; email: string; avatar: string; requestDate: string } => !!x); // remove undefined with type guard

                setRequests_(pending);

                try {
                    const friends = await getFriends();
                    const friendsArray = Array.isArray(friends) ? friends : [];
                    const friendsList = friendsArray
                        .filter((friend: any) =>
                            friend.user_id === foundUser.id || friend.friend_id === foundUser.id
                        )
                        .map((friend: any) => {
                            // Determina l'ID dell'altro utente (l'amico)
                            const friendUserId = friend.user_id === foundUser.id ? friend.friend_id : friend.user_id;
                            const friendUser = allUsers.find((u: any) => u.id === friendUserId);
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
                        .filter((x): x is { id: number; user_id: number; friend_id: number; username: string; email: string; avatar: string; status: string; lastSeen: string } => !!x); // remove undefined with type guard
                    setFriends_(friendsList);
                } catch (error) {
                    console.error('Error retrieving friends:', error);
                    setFriends_([]);
                }

            } else {
                setUser(null);
            }
        };
        fetchUser();
    }, [isLoggedIn]);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const challenges = await getChallenge();
                setChallenges(challenges);
                console.log(challenges);
            } catch (err) {
                console.error("Errore nel get delle sfide:", err);
            }
        };

        fetchChallenges(); // Esegui la funzione al caricamento del componente
    }, []); // L'array vuoto indica che l'effetto viene eseguito solo al montaggio del componente

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friends = await getFriends();
                const friendsArray = Array.isArray(friends) ? friends : [];
                const friendsList = friendsArray
                    .filter((friend: any) =>
                        friend.user_id === user.id || friend.friend_id === user.id
                    )
                    .map((friend: any) => {
                        // Determina l'ID dell'altro utente (l'amico)
                        const friendUserId = friend.user_id === user.id ? friend.friend_id : friend.user_id;
                        const friendUser = allUsers.find((u: any) => u.id === friendUserId);
                        if (!friendUser) return undefined;
                        return {
                            id: friendUser.id,
                            username: friendUser.username,
                            email: friendUser.email,
                            avatar: friendUser.avatar,
                            status: friend.status,
                            lastSeen: friend.last_seen,
                        };
                    })
                    .filter((x): x is { id: number; username: string; email: string; avatar: string; status: string; lastSeen: string } => !!x); // remove undefined with type guard
                setFriends_(friendsList);
            } catch (error) {
                console.error('Error retrieving friends:', error);
                setFriends_([]);
            }
        };

        if (user) {
            fetchFriends();
        }
    }, []);


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
