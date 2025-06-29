'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react';
import { Fragment, useEffect, useState } from 'react'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, Transition, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  HomeIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation'

const _navigation = [
  { name: 'Home', href: '/aluno/home', icon: HomeIcon, current: true },
  { name: 'Questionário', href: '/questionario', icon: ClipboardDocumentListIcon, current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter();
  const [navigation, setNavigation] = useState(_navigation);
  const pathname = usePathname()

  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace('/auth/signin');
    },
  });

  useEffect(() => {
    let nav = navigation.map((item) => {
      item.current = (item?.href?.startsWith(pathname));
      return item;
    });
    console.log("pathname", pathname);
    setNavigation(nav);
  }, [pathname]);

  if (status === "authenticated") {
    if (session?.user?.isAdmin === true) {
      router.replace('/admin/home');
    } else {
      return (
        <>
          <div>
            <Transition show={sidebarOpen} as={Fragment}>
              <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                <TransitionChild
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-gray-900/80" />
                </TransitionChild>

                <div className="fixed inset-0 flex">
                  <TransitionChild
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="ease-in-out duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                      <TransitionChild
                        as={Fragment}
                        enter="ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                          <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                            <span className="sr-only">Close sidebar</span>
                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                          </button>
                        </div>
                      </TransitionChild>
                      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                        <div className="flex h-16 shrink-0 items-center">
                          <img
                            className="h-8 w-auto"
                            src="https://ufr.edu.br/protic/wp-content/themes/ufr/assets/img/logo/ufr-wide.png"
                            alt="Logo"
                          />
                        </div>
                        <nav className="flex flex-1 flex-col">
                          <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                              <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => (
                                  <li key={item.name}>
                                    <Link
                                      href={item.href}
                                      className={classNames(
                                        item.current
                                          ? 'bg-gray-50 text-indigo-600'
                                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                      )}
                                    >
                                      <item.icon
                                        className={classNames(
                                          item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                          'h-6 w-6 shrink-0'
                                        )}
                                        aria-hidden="true"
                                      />
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </DialogPanel>
                  </TransitionChild>
                </div>
              </Dialog>
            </Transition>
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://ufr.edu.br/protic/wp-content/themes/ufr/assets/img/logo/ufr-wide.png"
                    alt="Your Company"
                  />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={classNames(
                                item.current
                                  ? 'bg-gray-50 text-indigo-600'
                                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                              )}
                            >
                              <item.icon
                                className={classNames(
                                  item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                  'h-6 w-6 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            <div className="lg:pl-72">
              <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
                <div className="flex h-16 items-center gap-x-4  border-gray-200 bg-gray-50 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <div className="relative flex flex-1" method="GET">
                    </div>
                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                      <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                      <Menu as="div" className="relative">
                        <MenuButton className="-m-1.5 flex items-center p-1.5 text-gray-500 hover:text-gray-700">
                          <span className="sr-only">Open user menu</span>
                          <UserCircleIcon className="h-8 w-8" aria-hidden="true" />

                          <span className="hidden lg:flex lg:items-center">
                            <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                                {session?.user?.email}
                            </span>
                            <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </MenuButton>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="opacity-0 scale-95"
                        >
                          <MenuItems className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">

                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    className={classNames(
                                      active ? 'bg-gray-50' : '',
                                      'w-full block px-3 py-1 text-sm leading-6 text-gray-900'
                                    )}
                                  >
                                    Seu perfil
                                  </button>
                                )}
                              </MenuItem>

                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className={classNames(
                                      active ? 'bg-gray-50' : '',
                                      'w-full block px-3 py-1 text-sm leading-6 text-gray-900'
                                    )}
                                  >
                                    Sair
                                  </button>
                                )}
                              </MenuItem>

                          </MenuItems>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>
              <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
              </main>
            </div>
          </div>
        </>
      )
    }
  }

  return <></>;
}