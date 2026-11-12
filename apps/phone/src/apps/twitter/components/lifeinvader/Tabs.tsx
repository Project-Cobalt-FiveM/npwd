import React from 'react';
import { useText } from '../../hooks/useText';
import { Link, useLocation } from 'react-router-dom';
import { House, Icon, MagnifyingGlass, User } from '@phosphor-icons/react';
import { cn } from '@utils/css';

interface Tab {
  path: string;
  labelKey: string;
  icon: Icon;
}

const tabs: readonly Tab[] = [
  { path: '/twitter', labelKey: 'COBALT.LIFEINVADER.HOME', icon: House },
  { path: '/twitter/search', labelKey: 'COBALT.LIFEINVADER.SEARCH', icon: MagnifyingGlass },
  { path: '/twitter/profile', labelKey: 'COBALT.LIFEINVADER.PROFILE', icon: User },
];

export const Tabs: React.FC = () => {
  const t = useText();
  const { pathname } = useLocation();
  const current = pathname.replace(/\/$/, '');

  return (
    <nav className="flex h-14 shrink-0 border-t border-[#D9D9D9] bg-white">
      {tabs.map(({ path, labelKey, icon: TabIcon }) => {
        const active = current === path;
        return (
          <Link
            key={path}
            to={path}
            replace
            aria-label={t(labelKey)}
            aria-current={active ? 'page' : undefined}
            className="group flex flex-1 items-center justify-center focus-visible:outline-none"
          >
            <span
              className={cn(
                'flex h-8 w-16 items-center justify-center rounded-full transition-[color,transform] duration-150 ease-cb group-focus-visible:ring-2 group-focus-visible:ring-[#D40604] group-active:scale-90',
                active ? 'text-[#D40604]' : 'text-[#6B6B6B]',
              )}
            >
              <TabIcon size={24} weight="fill" />
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
