import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const settingsNav = [
  { name: 'Account', href: '/dashboard/settings/account' },
  { name: 'Channels', href: '/dashboard/settings/channels' },
];

interface Props {
  children: ReactNode;
}

export default function SettingsLayout({ children }: Props) {
  const router = useRouter();

  return (
    <div>
      <div className="flex">
        <aside className="w-48 flex-shrink-0 mr-8">
          <nav className="space-y-1">
            {settingsNav.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    router.pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
