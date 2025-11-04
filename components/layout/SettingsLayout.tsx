import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiUser, FiLink, FiUsers } from 'react-icons/fi';

const settingsNav = [
  { name: 'Account', href: '/dashboard/settings/account', icon: FiUser },
  { name: 'Channels', href: '/dashboard/settings/channels', icon: FiLink },
  { name: 'Members', href: '/dashboard/settings/members', icon: FiUsers },
];

interface Props {
  children: ReactNode;
}

export default function SettingsLayout({ children }: Props) {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {settingsNav.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium ${
                    router.pathname === item.href
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                      router.pathname === item.href
                        ? 'text-gray-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </a>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          {children}
        </div>
      </div>
    </div>
  );
}
