"use client";

import React, {
    createContext,
    useState,
    useContext,
    ReactNode,
    useEffect,
    useMemo,
    type Dispatch,
    type SetStateAction,
} from 'react';
import { debugLog } from '../../../lib/debug';
import { supabase } from '../../../lib/supabase';
import it from '../../../public/locales/it.json'
import type { ChessChallenge } from '../../../services/challenge';
import type {
    CompletedChallenge,
    FriendProfile,
    FriendRequest,
    FriendRequestDisplay,
    Friendship,
    UserProfile,
} from '../../types/domain';
import AppSkeleton from './AppSkeleton';

type Translation = Record<string, string>;

interface PieceContextValue {
    activePiece: string | null;
    setActivePiece: Dispatch<SetStateAction<string | null>>;
    activeClass: string;
    hoverPiece: string | null;
    setHoverPiece: Dispatch<SetStateAction<string | null>>;
    isWhite: boolean;
    setIsWhite: Dispatch<SetStateAction<boolean>>;
    time: number;
    setTime: Dispatch<SetStateAction<number>>;
    mode: string;
    setMode: Dispatch<SetStateAction<string>>;
    isGameOver: string;
    setIsGameOver: Dispatch<SetStateAction<string>>;
    selectedPiece: string | null;
    setSelectedPiece: Dispatch<SetStateAction<string | null>>;
    subMovesDrag: string;
    setsubMovesDrag: Dispatch<SetStateAction<string>>;
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    user: UserProfile | null;
    setUser: Dispatch<SetStateAction<UserProfile | null>>;
    language: string;
    setLanguage: Dispatch<SetStateAction<string>>;
    t: Translation;
    setT: Dispatch<SetStateAction<Translation>>;
    darkMode: boolean;
    setDarkMode: Dispatch<SetStateAction<boolean>>;
    challenges: ChessChallenge[];
    setChallenges: Dispatch<SetStateAction<ChessChallenge[]>>;
    completedChallenges: CompletedChallenge[];
    setCompletedChallenges: Dispatch<SetStateAction<CompletedChallenge[]>>;
    requests: FriendRequestDisplay[];
    setRequests_: Dispatch<SetStateAction<FriendRequestDisplay[]>>;
    friends: FriendProfile[];
    setFriends_: Dispatch<SetStateAction<FriendProfile[]>>;
    allUsers: UserProfile[];
    setAllUsers: Dispatch<SetStateAction<UserProfile[]>>;
}

const PieceContext = createContext<PieceContextValue | null>(null);

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

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [profileReady, setProfileReady] = useState(false);

    const [selectedPiece, setSelectedPiece] = useState<string | null>(null); // Stato del pezzo attivo

    const [subMovesDrag, setsubMovesDrag] = useState<string>('');

    const [user, setUser] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [language, setLanguage] = useState<string>('it'); // Stato della lingua
    const [t, setT] = useState<Translation>(it);
    const [darkMode, setDarkMode] = useState(false); // Stato della modalità scura
    const [challenges, setChallenges] = useState<ChessChallenge[]>([]);
    const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([]);
    const [requests, setRequests_] = useState<FriendRequestDisplay[]>([]);
    const [friends, setFriends_] = useState<FriendProfile[]>([]);
    const userTextSize = user?.text_size;
    const userColorBlindMode = Boolean(user?.color_blind_mode);

    const activeClass = 'scale-[1.15] bg-[#ffff33] opacity-50 rounded-full';

    useEffect(() => {
        document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const textSize = ['small', 'medium', 'large'].includes(userTextSize ?? '')
            ? userTextSize!
            : 'medium';
        document.documentElement.dataset.textSize = textSize;
        document.documentElement.dataset.colorBlind = userColorBlindMode ? 'true' : 'false';
    }, [userColorBlindMode, userTextSize]);

    useEffect(() => {
        let active = true;
        void loadTranslations(language).then((translations) => {
            if (active) setT(translations);
        });
        return () => {
            active = false;
        };
    }, [language]);

    useEffect(() => {
        let active = true;

        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                if (active) setIsLoggedIn(Boolean(session));
            })
            .catch((error) => {
                console.error('Failed to restore the authentication session:', error);
                if (active) setIsLoggedIn(false);
            })
            .finally(() => {
                if (active) setAuthReady(true);
            });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (active) {
                setIsLoggedIn(Boolean(session));
                setAuthReady(true);
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let active = true;

        const fetchUserData = async () => {
            if (!authReady) return;

            setProfileReady(false);

            if (!isLoggedIn) {
                setUser(null);
                setAllUsers([]);
                setRequests_([]);
                setFriends_([]);
                setCompletedChallenges([]);
                setLanguage('it');
                setT(it);
                setDarkMode(false);
                setProfileReady(true);
                return;
            }

            setUser(null);
            setAllUsers([]);
            setRequests_([]);
            setFriends_([]);

            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authUser) {
                if (active) {
                    setUser(null);
                    setProfileReady(true);
                }
                return;
            }

            try {
                const loginService = await import('../../../services/login');
                const foundUser = await loginService.getOwnProfile(authUser.id);

                const currentUser = { ...foundUser, email: authUser.email ?? '' };
                const userLanguage = normalizeLanguage(foundUser.language);
                const translations = await loadTranslations(userLanguage);
                const userDarkMode = foundUser.theme || 'light';

                if (!active) return;

                setUser(currentUser);
                setAllUsers([currentUser]);
                setLanguage(userLanguage);
                setT(translations);
                setDarkMode(userDarkMode === 'dark');
                setProfileReady(true);
                debugLog('Found user:', foundUser);

                try {
                    const friendsService = await import('../../../services/friends');
                    const [directory, friendRequests, friendships] = await Promise.all([
                        loginService.getUserDirectory(),
                        friendsService.getRequests(),
                        friendsService.getFriends(),
                    ]);

                    if (!active) return;

                    const users = [
                        ...directory.filter((candidate) => candidate.id !== currentUser.id),
                        currentUser,
                    ];
                    setAllUsers(users);
                    setRequests_(formatFriendRequests(
                        friendRequests,
                        currentUser,
                        users,
                        translations,
                    ));
                    setFriends_(formatFriendsList(friendships, currentUser.id, users));
                    debugLog('All users:', users);
                } catch (error) {
                    if (active) {
                        setRequests_([]);
                        setFriends_([]);
                        console.error('Failed to load social data:', error);
                    }
                }
            } catch (err) {
                if (active) {
                    setUser(null);
                    setAllUsers([]);
                    setRequests_([]);
                    setFriends_([]);
                    setLanguage('it');
                    setT(it);
                    setDarkMode(false);
                    setProfileReady(true);
                    console.error('Failed to fetch user data:', err);
                }
            }
        };

        void fetchUserData();

        return () => {
            active = false;
        };
    }, [authReady, isLoggedIn]);

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

    const contextValue = useMemo<PieceContextValue>(() => ({
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
        }), [
            activePiece,
            allUsers,
            challenges,
            completedChallenges,
            darkMode,
            friends,
            hoverPiece,
            isGameOver,
            isLoggedIn,
            isWhite,
            language,
            mode,
            requests,
            selectedPiece,
            subMovesDrag,
            t,
            time,
            user,
        ]);

    return (
        <PieceContext.Provider value={contextValue}>
            {children}
            {(!authReady || !profileReady) && <ApplicationBootstrap />}
        </PieceContext.Provider>
    );
};

function formatFriendRequests(
    friendRequests: FriendRequest[],
    user: UserProfile,
    users: UserProfile[],
    translations: Translation,
): FriendRequestDisplay[] {
    return friendRequests
        .filter((request) => request.receiver_id === user.id)
        .map((request) => {
            const sender = users.find((candidate) => candidate.id === request.sender_id);
            if (!sender) return undefined;

            const sentAt = new Date(request.sent_at);
            const now = new Date();
            const diffMs = now.getTime() - sentAt.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            let requestDate = '';
            if (diffDays === 0) requestDate = translations.today || 'Today';
            else if (diffDays === 1) requestDate = translations.yesterday || 'Yesterday';
            else requestDate = `${diffDays} ${translations.daysAgo || 'days ago'}`;

            return {
                id: request.id,
                sender_id: request.sender_id,
                receiver_id: request.receiver_id,
                sent_at: request.sent_at,
                username: sender.username ?? undefined,
                email: sender.email ?? undefined,
                avatar: sender.avatar ?? undefined,
                requestDate,
            };
        })
        .filter((request): request is NonNullable<typeof request> => Boolean(request));
}

function formatFriendsList(
    friendships: Friendship[],
    userId: number,
    users: UserProfile[],
): FriendProfile[] {
    return friendships
        .filter((friend) => friend.user_id === userId || friend.friend_id === userId)
        .map((friend) => {
            const friendUserId = friend.user_id === userId ? friend.friend_id : friend.user_id;
            const friendUser = users.find((candidate) => candidate.id === friendUserId);
            if (!friendUser) return undefined;

            return {
                id: friend.id,
                user_id: friend.user_id,
                friend_id: friend.friend_id,
                username: friendUser.username ?? undefined,
                email: friendUser.email ?? undefined,
                avatar: friendUser.avatar ?? undefined,
                status: friendUser.status,
                lastSeen: friendUser.last_seen ?? undefined,
            };
        })
        .filter((friend): friend is NonNullable<typeof friend> => Boolean(friend));
}

function ApplicationBootstrap() {
    return <AppSkeleton overlay label="Preparazione del profilo BoardVerse" />;
}

async function loadTranslations(language: string) {
    switch (language) {
        case 'en': return (await import('../../../public/locales/en.json')).default;
        case 'es': return (await import('../../../public/locales/es.json')).default;
        case 'fr': return (await import('../../../public/locales/fr.json')).default;
        case 'de': return (await import('../../../public/locales/de.json')).default;
        default: return it;
    }
}

function normalizeLanguage(language?: string | null): string {
    const normalized = language?.toLocaleLowerCase();
    const aliases: Record<string, string> = {
        italiano: 'it',
        english: 'en',
        español: 'es',
        français: 'fr',
        deutsch: 'de',
    };
    return aliases[normalized ?? ''] ?? (
        ['it', 'en', 'es', 'fr', 'de'].includes(normalized ?? '')
            ? normalized!
            : 'it'
    );
}

export const usePieceContext = () => {
    const context = useContext(PieceContext);
    if (!context) {
        throw new Error('usePieceContext deve essere utilizzato all\'interno di un PieceProvider');
    }
    return context;
};
