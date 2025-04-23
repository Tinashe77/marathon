// src/components/Layout.jsx
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  MapIcon,
  FlagIcon,
  EnvelopeIcon,
  XMarkIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // You'll need to replace this with Econet logo

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Runners', href: '/runners', icon: UsersIcon },
  { name: 'Routes', href: '/routes', icon: MapIcon },
  { name: 'Races', href: '/races', icon: FlagIcon },
  { name: 'Communications', href: '/communications', icon: EnvelopeIcon },
  { name: 'Admin Users', href: '/admin-users', icon: ShieldCheckIcon },
];

const Logo = () => (
  <div className="flex items-center gap-3">
    <img src={logo} alt="Econet Marathon" className="h-10 w-auto" />
    <span className="text-white text-xl font-bold tracking-wider">Econet Marathon</span>
  </div>
);

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const NavLinks = () => (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => (
        <li key={item.name}>
          <Link
            to={item.href}
            className={`
              group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
              transition-all duration-150 ease-in-out
              ${location.pathname === item.href
                ? 'bg-primary-700 text-white shadow-sm'
                : 'text-primary-100 hover:text-white hover:bg-primary-700/70'
              }
            `}
          >
            <item.icon 
              className={`h-6 w-6 shrink-0 transition-colors duration-150
                ${location.pathname === item.href ? 'text-white' : 'text-primary-200'}
              `} 
              aria-hidden="true" 
            />
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
  
  return (
    <>
      <div>
        {/* Mobile sidebar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-full flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary-600 px-6 pb-4 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <Logo />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <NavLinks />
                        </li>
                        <li className="mt-auto">
                          <button
                            onClick={handleLogout}
                            className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary-200 hover:bg-primary-700 hover:text-white transition-all duration-150"
                          >
                            <ArrowRightOnRectangleIcon className="h-6 w-6" />
                            Logout
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary-600 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Logo />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <NavLinks />
                </li>
                <li className="mt-auto border-t border-primary-500/50 pt-4">
                  <button
                    onClick={handleLogout}
                    className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary-200 hover:bg-primary-700 hover:text-white transition-all duration-150"
                  >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button 
              type="button" 
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-md transition-colors duration-150" 
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1">
                <span className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Econet Marathon Admin'}
                </span>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Profile dropdown could go here */}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;