import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { usePieceContext } from './PieceContext'
import { updateLastSeen } from '../../../services/lastSeen'
import { useState, useMemo } from 'react'
import FriendsChatModal from "./FriendsChatModal";
import Link from 'next/link'

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * NavBar component renders the main navigation bar for the application.
 * 
 * Features:
 * - Responsive navigation links with active state highlighting.
 * - Dark mode and light mode styling support.
 * - Mobile menu with disclosure for smaller screens.
 * - Friends chat modal toggle button.
 * - User profile dropdown menu with links to profile, settings, and authentication actions.
 * - Displays user avatar and handles login/logout state.
 * 
 * @param {object} props - Component props.
 * @param {number} [props.current=0] - The index of the currently active navigation item.
 * 
 * @returns {JSX.Element} The rendered navigation bar component.
 */
export default function NavBar({ current = 0 }: { current?: number }) {

  const { t, darkMode, isLoggedIn, setIsLoggedIn, user} = usePieceContext();
  const [showChatModal, setShowChatModal] = useState(false);

  const navigation = useMemo(() => [
    { name: t.home, href: '/', current: current === 0 },
    { name: t.gameTypes, href: 'gameMode', current: current === 1},
    // { name: t.statistics, href: 'statistics', current: current === 2},
    { name: t.friends, href: 'friends', current: current === 3},
    { name: t.about, href: 'about', current: current === 4},
  ], [t, current]);

  return (
    <Disclosure as="nav" className={`bg-gradient-to-r ${darkMode ? 'from-slate-800 to-slate-900' : 'from-green-800 to-green-900 shadow-lg'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className={`group relative inline-flex items-center justify-center rounded-lg p-2 ${darkMode ? 'text-slate-200 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400' : 'text-green-200 hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400'} transition-all duration-200`}>
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Image
                alt="My App"
                src="/logo.svg"
                width={100}
                height={100}
                className="h-14 w-auto brightness-125 rounded-xl"
              />
            </div>
            <div className="hidden sm:ml-8 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current
                        ? (darkMode
                          ? 'bg-slate-700 text-white ring-2 ring-slate-400 ring-opacity-50'
                          : 'bg-green-700 text-white ring-2 ring-green-400 ring-opacity-50'
                        )
                        : (darkMode
                          ? 'text-slate-100 hover:bg-slate-700/50 hover:text-white'
                          : 'text-green-100 hover:bg-green-700/50 hover:text-white'
                        ),
                      'rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-lg'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 gap-4">

            <div className="relative">
              <button
              type="button"
              className={`relative rounded-lg ${darkMode ? 'bg-slate-700/30 p-2 text-slate-200 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800' : 'bg-green-700/30 p-2 text-green-200 hover:text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-800'} transition-all duration-200`}
              onClick={() => setShowChatModal((prev) => !prev)}
              >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View friends chat</span>
              <ChatBubbleBottomCenterTextIcon aria-hidden="true" className="size-6" />
              </button>

              <div className="flex justify-between items-center">
                <button
                  className="text-xl font-bold hover:text-red-500"
                  onClick={() => setShowChatModal(false)}
                  aria-label="Close chat modal"
                >
                </button>
              </div>
            </div>
            <FriendsChatModal show={showChatModal} onClose={() => setShowChatModal(false)} darkMode={darkMode} t={t} />
            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className={`relative flex rounded-lg ${darkMode? 'bg-slate-700/30 p-1 text-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800':'bg-green-700/30 p-1 text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-800'} transition-all duration-200`}>
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <Image
                    alt="User Avatar"
                    src={user?.avatar || '/default_avatar.png'}
                    width={40}
                    height={40}
                    className="size-12 rounded-lg"
                  />
                </MenuButton>
              </div>
              <MenuItems
                transition
                className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg ${darkMode ? 'bg-slate-900' : 'bg-white'} py-1 shadow-xl ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in`}
              >
                {isLoggedIn && (
                  <MenuItem>
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-sm ${darkMode? 'text-white':'text-gray-700'} hover:bg-${darkMode ? 'slate-700' : 'green-50'} transition-colors duration-150 data-[focus]:bg-${darkMode ? 'slate-700' : 'green-50'} data-[focus]:outline-none`}
                    >
                      {t.profile}
                    </Link>
                  </MenuItem>
                )}
                {isLoggedIn && (
                  <MenuItem>
                    <Link
                      href="/settingsProfile"
                      className={`block px-4 py-2 text-sm ${darkMode? 'text-white':'text-gray-700'} hover:bg-${darkMode ? 'slate-700' : 'green-50'} transition-colors duration-150 data-[focus]:bg-${darkMode ? 'slate-700' : 'green-50'} data-[focus]:outline-none`}
                    >
                      {t.settings}
                    </Link>
                  </MenuItem>)}
                <MenuItem>
                  {isLoggedIn ? (
                    <Link
                      href='#'
                      className={`block px-4 py-2 text-sm ${darkMode? 'text-white':'text-gray-700'} hover:bg-${darkMode ? 'slate-700' : 'green-50'} transition-colors duration-150 data-[focus]:bg-${darkMode ? 'slate-700' : 'green-50'} data-[focus]:outline-none`}
                      onClick={async () => {
                        try {
                          await updateLastSeen({ userID: user.id });
                        } catch (err) {
                          console.error('Failed to update last seen:', err);
                        }
                        setIsLoggedIn('');
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                      }}
                    >
                      {t.logout}
                    </Link>
                  ) : (
                    <Link
                      href='/login'
                      className={`block px-4 py-2 text-sm ${darkMode? 'text-white':'text-gray-700'} hover:bg-${darkMode ? 'slate-700' : 'green-50'} transition-colors duration-150 data-[focus]:bg-${darkMode ? 'slate-700' : 'green-50'} data-[focus]:outline-none`}
                    >
                      {t.signin}
                    </Link>
                  )}
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-2 px-3 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700/50 hover:text-white',
                'block rounded-lg px-3 py-2 text-base font-medium transition-all duration-200'
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}