import {
    Gamepad2,
    Home,
    Info,
    Menu,
    Settings,
    UsersRound,
    X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePieceContext } from "./PieceContext";

export default function SideBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, t } = usePieceContext();

    const menuItems = [
        { name: t.home, icon: Home, href: "/" },
        { name: t.gameTypes, icon: Gamepad2, href: "/gameMode" },
        { name: t.friends, icon: UsersRound, href: "/friends" },
        { name: t.about, icon: Info, href: "/about" },
    ];

    return (
        <>
            <button
                id="SidebarButton"
                type="button"
                onClick={() => setIsOpen(true)}
                aria-expanded={isOpen}
                aria-controls="game-sidebar"
                className={`bv-glass-strong fixed left-3 top-3 z-50 grid h-11 w-11 place-items-center rounded-xl text-[var(--bv-text)] transition hover:-translate-y-0.5 sm:left-4 sm:top-4 ${
                    isOpen ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
            >
                <span className="sr-only">Apri navigazione</span>
                <Menu aria-hidden="true" className="h-5 w-5" />
            </button>

            <aside
                id="game-sidebar"
                className={`bv-glass-strong fixed inset-y-3 left-3 z-[70] flex w-[min(18rem,calc(100vw-1.5rem))] flex-col rounded-[1.75rem] p-3 text-[var(--bv-text)] transition-transform duration-300 sm:inset-y-4 sm:left-4 ${
                    isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
                }`}
                aria-label="Navigazione partita"
            >
                <div className="flex items-center justify-between px-2 py-2">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-500">BoardVerse</p>
                        <h2 className="mt-1 text-xl font-black">{t.gameTypes}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-white/25 text-[var(--bv-muted)] hover:text-[var(--bv-text)] dark:border-white/10 dark:bg-white/5"
                        aria-label="Chiudi navigazione"
                    >
                        <X aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>

                <nav className="mt-5 flex-1" aria-label="Collegamenti partita">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="group flex items-center gap-3 rounded-xl px-3 py-3 font-bold text-[var(--bv-muted)] transition hover:bg-emerald-500/10 hover:text-[var(--bv-text)]"
                                    >
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/25 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white dark:bg-white/5 dark:text-emerald-300">
                                            <Icon aria-hidden="true" className="h-4 w-4" />
                                        </span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="mt-4 border-t border-black/5 pt-3 dark:border-white/10">
                    <Link
                        href="/settingsProfile"
                        className="flex items-center gap-3 rounded-xl px-3 py-3 font-bold text-[var(--bv-muted)] transition hover:bg-violet-500/10 hover:text-[var(--bv-text)]"
                    >
                        <Settings aria-hidden="true" className="h-5 w-5 text-violet-500" />
                        {t.profileSettings}
                    </Link>

                    {user && (
                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/25 p-3 dark:border-white/10 dark:bg-white/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.avatar || "/default_avatar.png"}
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-black">{user.username}</p>
                                <p className="text-xs text-[var(--bv-muted)]">Online</p>
                            </div>
                            <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10" />
                        </div>
                    )}
                </div>
            </aside>

            {isOpen && (
                <button
                    type="button"
                    aria-label="Chiudi navigazione"
                    className="bv-modal-backdrop fixed inset-0 z-[60] cursor-default"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
