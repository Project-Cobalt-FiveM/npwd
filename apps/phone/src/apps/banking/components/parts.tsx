import React from 'react';
import '@fontsource/arimo/400.css';
import '@fontsource/arimo/700.css';
import { BankingAccount, BankingAccountType, BankingFailure, BankingRole } from '@typings/banking';
import { cn } from '@utils/css';
import fleecaLogo from '../assets/fleeca-logo.png';
import fleecaCard from '../assets/fleeca-card-front.jpg';
import eyefindThumb from '../assets/eyefind-thumb.png';

export const DANGER = '#B03A34';
export const MONEY_IN = '#0F532A';

export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F532A]';

export const canSend = (account: BankingAccount): boolean => account.role !== 'viewer';

export const failureKey = (reason: BankingFailure): string =>
  `COBALT.BANKING.FAIL_${reason.toUpperCase()}`;

export const roleLabelKey = (type: BankingAccountType, role: BankingRole): string | null => {
  if (type !== 'society') return null;
  return {
    owner: 'COBALT.BANKING.ROLE_BOSS',
    admin: 'COBALT.BANKING.ROLE_TRANSFER',
    member: 'COBALT.BANKING.ROLE_TRANSFER',
    viewer: 'COBALT.BANKING.ROLE_VIEWER',
  }[role];
};

export const FleecaPage: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#E7E7E7] font-[Arimo,Arial,sans-serif] text-[#1E201E]',
      className,
    )}
  >
    {children}
  </div>
);

export const SiteHeader: React.FC = () => (
  <header className="flex shrink-0 flex-col px-4 pt-2">
    <img src={fleecaLogo} alt="Fleeca Bank" className="h-[44px] w-[110px]" />
    <div className="mt-1.5 h-px bg-[#2F9D46]" />
  </header>
);

export const ScreenTitle: React.FC<{ title: React.ReactNode; caption?: React.ReactNode }> = ({
  title,
  caption,
}) => (
  <div className="flex flex-col items-center px-4 pb-3.5 pt-4 text-center">
    <h1 className="text-xl font-normal leading-7">{title}</h1>
    {caption && <p className="text-[13px] leading-[18px] text-[#555A55]">{caption}</p>}
  </div>
);

export interface FleecaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  wide?: boolean;
}

export const FleecaButton: React.FC<FleecaButtonProps> = ({
  wide,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled}
    className={cn(
      'flex h-11 items-center justify-center rounded-[3px] border px-4 text-base transition-[filter,transform] duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E201E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E7E7] active:scale-[0.98]',
      wide ? 'w-full' : 'w-60',
      disabled
        ? 'border-[#B9BCB9] bg-[#D5D8D5] text-[#7A7F7A] active:scale-100'
        : 'border-[#198943] bg-[linear-gradient(180deg,#268C44_0%,#186B35_55%,#084929_100%)] text-[#E6F1E6] hover:brightness-110',
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);

export const TextLink: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  children,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={cn('rounded text-sm leading-[18px] text-[#0F532A] underline', FOCUS_RING, className)}
    {...rest}
  >
    {children}
  </button>
);

export const ListLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <p className={cn('pb-1 text-[13px] leading-[18px] text-[#555A55]', className)}>{children}</p>;

export const rowClass = (first: boolean) =>
  cn(
    'flex w-full items-center gap-3 border-t py-2.5 text-left',
    first ? 'border-[#2F9D46]' : 'border-[#C3C7C3]',
  );

export const RowEnd: React.FC = () => <div className="border-t border-[#C3C7C3]" />;

export const CardThumb: React.FC<{ type: BankingAccountType }> = ({ type }) => (
  <img
    src={type === 'society' ? eyefindThumb : fleecaCard}
    alt=""
    className="h-[29px] w-[46px] shrink-0 rounded-[3px] border border-[#B9BCB9] object-cover"
  />
);

export const CardArt: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src={fleecaCard}
    alt="Fleeca credit card"
    className={cn('rounded-[10px] shadow-[0_5px_0_#BFC2BF]', className)}
  />
);

interface AdStripProps {
  image: string;
  imageClassName?: string;
  title: string;
  body: string;
}

export const AdStrip: React.FC<AdStripProps> = ({ image, imageClassName, title, body }) => (
  <aside className="mx-4 mt-3 flex items-center gap-2.5 border-2 border-[#1B9339] bg-[#F4F4EE] py-1.5 pl-1.5 pr-2.5">
    <img src={image} alt="" className={cn('h-14 w-[72px] shrink-0 object-cover', imageClassName)} />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className="text-[13px] font-bold leading-4">{title}</p>
      <p className="text-xs leading-[15px] text-[#3E433E]">{body}</p>
    </div>
  </aside>
);

export const FinePrint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-auto px-4 pb-2.5 pt-4 text-center text-[10px] leading-[13px] text-[#6A6F6A]">
    {children}
  </p>
);

export const DetailRow: React.FC<{ label: string; first?: boolean; children: React.ReactNode }> = ({
  label,
  first,
  children,
}) => (
  <div
    className={cn('flex gap-4 border-t py-[11px]', first ? 'border-[#2F9D46]' : 'border-[#C3C7C3]')}
  >
    <span className="w-[72px] shrink-0 text-sm leading-5 text-[#555A55]">{label}</span>
    <div className="min-w-0 flex-1 text-right text-[15px] tabular-nums leading-5">{children}</div>
  </div>
);
