import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu as HeadlessMenu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {
  BarChart3,
  ChevronDown,
  Gamepad2,
  Home,
  Info,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { updateLastSeen } from '../../../services/lastSeen';
import FriendsChatModal from './FriendsChatModal';
import { usePieceContext } from './PieceContext';

export default function NavBar({ current = 0 }: { current?: number }) {
  const { t, darkMode, isLoggedIn, setIsLoggedIn, user } = usePieceContext();
  const [showChatModal, setShowChatModal] = useState(false);

  const navigation = useMemo(() => [
    { name: t.home, href: '/', current: current === 0, icon: Home },
    { name: t.gameTypes, href: '/gameMode', current: current === 1, icon: Gamepad2 },
    { name: t.statistics, href: '/statistics', current: current === 2, icon: BarChart3 },
    { name: t.friends, href: '/friends', current: current === 3, icon: UsersRound },
    { name: t.about, href: '/about', current: current === 4, icon: Info },
  ], [current, t]);

  const logout = async () => {
    try {
      if (user) await updateLastSeen({ userID: user.id });
    } catch (error) {
      console.error('Failed to update last seen:', error);
    }
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setShowChatModal(false);
  };

  return (
    <Disclosure
      as="nav"
      aria-label="Navigazione principale"
      className="bv-glass-strong bv-liquid relative mx-auto max-w-7xl rounded-[1.35rem] shadow-[0_18px_55px_-30px_rgba(3,35,26,0.65)]"
    >
      <div className="relative flex h-16 items-center gap-2 px-2 sm:h-[4.25rem] sm:px-3">
        <DisclosureButton
          className="group grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/5 bg-white/30 text-[var(--bv-text)] transition hover:bg-white/50 sm:hidden dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          aria-label="Apri menu principale"
        >
          <Menu aria-hidden="true" className="h-5 w-5 group-data-[open]:hidden" />
          <X aria-hidden="true" className="hidden h-5 w-5 group-data-[open]:block" />
        </DisclosureButton>

        <Link
          href="/"
          aria-label="BoardVerse home"
          className="flex shrink-0 items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-white/20"
        >
          <Image
            alt=""
            src="/logo.svg"
            width={56}
            height={56}
            className="h-11 w-11 rounded-xl object-contain"
            priority
          />
          <span className="hidden text-base font-black tracking-[-0.035em] text-[var(--bv-text)] lg:block">
            BoardVerse
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 sm:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={`group flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition lg:px-4 ${
                  item.current
                    ? 'bg-emerald-500/15 text-emerald-800 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)] dark:text-emerald-200'
                    : 'text-[var(--bv-muted)] hover:bg-white/30 hover:text-[var(--bv-text)] dark:hover:bg-white/10'
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 opacity-75" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {isLoggedIn && user && (
            <button
              type="button"
              onClick={() => setShowChatModal((previous) => !previous)}
              aria-expanded={showChatModal}
              aria-label={showChatModal ? 'Chiudi chat amici' : 'Apri chat amici'}
              className={`relative grid h-11 w-11 place-items-center rounded-xl border transition ${
                showChatModal
                  ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                  : 'border-black/5 bg-white/25 text-[var(--bv-muted)] hover:bg-white/50 hover:text-[var(--bv-text)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
              }`}
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white/80 dark:ring-slate-900" />
            </button>
          )}

          {isLoggedIn && user && (
            <FriendsChatModal
              show={showChatModal}
              onClose={() => setShowChatModal(false)}
              darkMode={darkMode}
              t={t}
            />
          )}

          <HeadlessMenu as="div" className="relative">
            <MenuButton className="flex h-11 items-center gap-1 rounded-xl border border-black/5 bg-white/25 p-1 pr-2 text-[var(--bv-text)] transition hover:bg-white/50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
              <Image
                alt="Avatar utente"
                src={user?.avatar || '/default_avatar.png'}
                width={40}
                height={40}
                className="h-9 w-9 rounded-[0.65rem] object-cover ring-1 ring-black/5 dark:ring-white/10"
              />
              <ChevronDown aria-hidden="true" className="h-4 w-4 opacity-55" />
              <span className="sr-only">Apri menu utente</span>
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="bv-glass-strong z-[120] mt-2 w-56 origin-top-right rounded-2xl p-2 text-[var(--bv-text)] shadow-2xl transition [--anchor-gap:0.5rem] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              {isLoggedIn && (
                <>
                  <MenuItem>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold data-[focus]:bg-emerald-500/10"
                    >
                      <UserRound aria-hidden="true" className="h-4 w-4 text-emerald-500" />
                      {t.profile}
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      href="/settingsProfile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold data-[focus]:bg-emerald-500/10"
                    >
                      <Settings aria-hidden="true" className="h-4 w-4 text-violet-500" />
                      {t.settings}
                    </Link>
                  </MenuItem>
                </>
              )}

              <MenuItem>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-rose-600 data-[focus]:bg-rose-500/10 dark:text-rose-300"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    {t.logout}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold data-[focus]:bg-emerald-500/10"
                  >
                    <LogIn aria-hidden="true" className="h-4 w-4 text-emerald-500" />
                    {t.signin}
                  </Link>
                )}
              </MenuItem>
            </MenuItems>
          </HeadlessMenu>
        </div>
      </div>

      <DisclosurePanel className="border-t border-black/5 p-2 sm:hidden dark:border-white/10">
        <div className="grid grid-cols-2 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <DisclosureButton
                key={item.name}
                as={Link}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${
                  item.current
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                    : 'text-[var(--bv-muted)] hover:bg-white/30 hover:text-[var(--bv-text)] dark:hover:bg-white/5'
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {item.name}
              </DisclosureButton>
            );
          })}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
