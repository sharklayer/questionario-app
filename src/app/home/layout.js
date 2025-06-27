'use client'

import Link from 'next/link'
import { Fragment, useEffect } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { signOut, useSession } from 'next-auth/react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout({ children }) {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      if (session?.user?.is_admin === true) {
        router.replace('/admin/home');
      }
    }
  }, [session]);

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-white shadow-sm border-b">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    {status === 'authenticated' && (
                      <>
                        <div className="flow-root">
                          <a href="#" className="group -m-2 flex items-center p-2">
                            <ShoppingCartIcon
                              className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">0</span>
                            <span className="sr-only">items in cart, view bag</span>
                          </a>
                        </div>
                        <span className="mx-4 h-6 w-px bg-gray-200 lg:mx-6" aria-hidden="true" />
                        <Menu as="div" className="relative ml-3">
                          <div>
                            <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                              <span className="absolute -inset-1.5" />
                              <span className="sr-only">Open user menu</span>
                              <img
                                className="h-8 w-8 rounded-full bg-gray-50"
                                src={userImageUrl}
                                alt=""
                              />
                            </Menu.Button>
                          </div>
                        </Menu>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>
        <main>{children}</main>
      </div>
    </>
  );
}