import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function NavBar({ current = 0 }: { current?: number }) {
  const navigation = [
    { name: 'Home', href: '/', current: current === 0 },
    { name: 'Board Games', href: '#', current: current === 1 },
    { name: 'Leaderboards', href: '#', current: current === 2 },
    { name: 'About', href: '#', current: current === 3 },
  ]

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-green-800 to-green-900 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-lg p-2 text-green-200 hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400 transition-all duration-200">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                alt="My App"
                src="./logo.svg"
                className="h-14 w-auto brightness-125"
              />
            </div>
            <div className="hidden sm:ml-8 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current 
                        ? 'bg-green-700 text-white ring-2 ring-green-400 ring-opacity-50' 
                        : 'text-green-100 hover:bg-green-700/50 hover:text-white',
                      'rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-lg'
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 gap-4">
            <button
              type="button"
              className="relative rounded-lg bg-green-700/30 p-2 text-green-200 hover:text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-800 transition-all duration-200"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="size-6" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-lg bg-green-700/30 p-1 text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-800 transition-all duration-200">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src="/profile-circle.svg"
                    className="size-8 rounded-lg"
                  />
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-xl ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150 data-[focus]:bg-green-50 data-[focus]:outline-none"
                  >
                    Your Profile
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150 data-[focus]:bg-green-50 data-[focus]:outline-none"
                  >
                    Settings
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150 data-[focus]:bg-green-50 data-[focus]:outline-none"
                  >
                    Sign out
                  </a>
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