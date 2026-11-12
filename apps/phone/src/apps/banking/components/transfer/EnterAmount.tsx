import React, { useEffect } from 'react';
import { BankingAccount, BankingRecipient } from '@typings/banking';
import { cn } from '@utils/css';
import { useText } from '@apps/gallery/hooks/useText';
import { endingDigits, formatMoney } from '../../utils/format';
import { DANGER, FleecaPage, ScreenTitle, SiteHeader, TextLink } from '../parts';

const MAX_DIGITS = 9;

type Key = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'del' | 'enter';

const KEY_ROWS: Key[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['del', '0', 'enter'],
];

interface EnterAmountProps {
  from: BankingAccount;
  recipient: BankingRecipient;
  amount: string;
  note: string;
  onAmount: (update: (current: string) => string) => void;
  onNote: (note: string) => void;
  onChangeAccount: () => void;
  onReview: () => void;
}

const pressDigit = (amount: string, digit: string): string => {
  const next = (amount + digit).replace(/^0+/, '');
  return next.length > MAX_DIGITS ? amount : next;
};

const keyFace =
  'flex h-11 flex-1 items-center justify-center rounded-[3px] border border-[#6E7A82] bg-[linear-gradient(180deg,#E6E9E9_0%,#C3C8C9_100%)] transition-transform duration-150 ease-cb active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F532A] disabled:active:scale-100';

export const EnterAmount: React.FC<EnterAmountProps> = ({
  from,
  recipient,
  amount,
  note,
  onAmount,
  onNote,
  onChangeAccount,
  onReview,
}) => {
  const text = useText();
  const value = Number(amount || 0);
  const short = value > from.balance;
  const ready = value > 0 && !short;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (/^\d$/.test(event.key)) onAmount((current) => pressDigit(current, event.key));
      if (event.key === 'Enter' && ready) onReview();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ready, onAmount, onReview]);

  const press = (key: Key) => {
    if (key === 'enter') return ready && onReview();
    onAmount((current) => (key === 'del' ? current.slice(0, -1) : pressDigit(current, key)));
  };

  const label = (key: Key) =>
    key === 'del'
      ? text('COBALT.BANKING.KEY_DEL')
      : key === 'enter'
      ? text('COBALT.BANKING.KEY_ENTER')
      : key;

  return (
    <FleecaPage>
      <SiteHeader />
      <ScreenTitle
        title={text('COBALT.BANKING.TRANSFER')}
        caption={text('COBALT.BANKING.STEP_AMOUNT')}
      />
      <div className="flex flex-col gap-2.5 px-4">
        <div className="flex flex-col gap-0.5 border-y border-b-[#C3C7C3] border-t-[#2F9D46] py-2">
          <p className="truncate text-sm leading-5">
            {text('COBALT.BANKING.TO_ACCOUNT', {
              name: recipient.name,
              account: text(`COBALT.BANKING.ACCOUNT_${recipient.type.toUpperCase()}`, {
                digits: endingDigits(recipient.accountId),
              }).toLowerCase(),
            })}
          </p>
          <p className="truncate text-[13px] leading-[18px] text-[#555A55]">
            {text('COBALT.BANKING.FROM_ACCOUNT', {
              name: from.name,
              digits: endingDigits(from.accountId),
            })}
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5 py-1 text-center">
          <p
            className="text-[40px] tabular-nums leading-[48px]"
            style={{ color: short ? DANGER : '#1E201E' }}
            aria-live="polite"
          >
            {formatMoney(value)}
          </p>
          {short ? (
            <>
              <p className="text-[13px] leading-[18px]" style={{ color: DANGER }}>
                {text('COBALT.BANKING.NOT_ENOUGH', {
                  name: from.name,
                  have: formatMoney(from.balance),
                })}
              </p>
              <TextLink className="mt-1" onClick={onChangeAccount}>
                {text('COBALT.BANKING.CHANGE_ACCOUNT')}
              </TextLink>
            </>
          ) : (
            <p className="text-[13px] leading-[18px] text-[#555A55]">
              {text('COBALT.BANKING.AVAILABLE', {
                amount: formatMoney(from.balance),
                name: from.name,
              })}
              <br />
              {text('COBALT.BANKING.FEE_JOKE')}
            </p>
          )}
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[13px] leading-[18px] text-[#555A55]">
            {text('COBALT.BANKING.NOTE_OPTIONAL')}
          </span>
          <input
            name="note"
            autoComplete="off"
            maxLength={60}
            value={note}
            onChange={(event) => onNote(event.target.value)}
            className="h-10 rounded-sm border border-[#8E938E] bg-[#F3F4F3] px-3 text-[15px] outline-none focus:border-[#2F9D46]"
          />
        </label>
        <div className="flex flex-col gap-1.5 px-6 pt-2" aria-label={text('COBALT.BANKING.KEYPAD')}>
          {KEY_ROWS.map((row) => (
            <div key={row.join('')} className="flex gap-1.5">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={key === 'enter' && !ready}
                  onClick={() => press(key)}
                  className={cn(
                    keyFace,
                    key === 'del' && 'text-[13px] tracking-[0.06em] text-[#B03A34]',
                    key === 'enter' &&
                      (ready
                        ? 'text-[13px] tracking-[0.06em] text-[#1E7A33]'
                        : 'text-[13px] tracking-[0.06em] text-[#8E938E]'),
                    key !== 'del' && key !== 'enter' && 'text-xl text-[#303434]',
                  )}
                >
                  {label(key)}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="h-4 shrink-0" />
    </FleecaPage>
  );
};
