import React from 'react';
import { useHistory } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/css';
import { IconButton } from './IconButton';

export interface AppBarProps {
  title: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const AppBar: React.FC<AppBarProps> = ({ title, back, onBack, actions, className }) => {
  const history = useHistory();
  const [t] = useTranslation();
  const showBack = back || Boolean(onBack);

  return (
    <header
      className={cn(
        'flex h-16 w-full shrink-0 items-center gap-1 bg-cb-background px-2 text-cb-foreground',
        !showBack && 'pl-4',
        className,
      )}
    >
      {showBack && (
        <IconButton label={t('COBALT.BACK')} onClick={onBack ?? (() => history.goBack())}>
          <ArrowLeft size={22} weight="fill" />
        </IconButton>
      )}
      <h1 className="min-w-0 flex-1 truncate text-[22px] font-normal leading-7">{title}</h1>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
};
