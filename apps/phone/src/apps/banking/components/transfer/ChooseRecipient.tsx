import React, { useEffect, useRef, useState } from 'react';
import { BankingAccount, BankingRecipient } from '@typings/banking';
import { cn } from '@utils/css';
import { useText } from '@apps/gallery/hooks/useText';
import posterAdvisor from '../../assets/poster-advisor.jpg';
import { bankingApi } from '../../hooks/bankingApi';
import {
  dayDistance,
  endingDigits,
  formatDayMonth,
  formatMoney,
  formatWeekday,
  normaliseRecipient,
} from '../../utils/format';
import {
  AdStrip,
  CardThumb,
  DANGER,
  FleecaButton,
  FleecaPage,
  FOCUS_RING,
  ListLabel,
  rowClass,
  RowEnd,
  ScreenTitle,
  SiteHeader,
  TextLink,
} from '../parts';

type Tab = 'mine' | 'other';

type Lookup =
  | { status: 'idle' }
  | { status: 'searching'; query: string }
  | { status: 'found'; recipient: BankingRecipient }
  | { status: 'missing'; query: string };

const LOOKUP_DELAY = 450;
const MIN_QUERY = 4;

interface ChooseRecipientProps {
  from: BankingAccount;
  accounts: BankingAccount[];
  onPick: (recipient: BankingRecipient) => void;
}

const lastPaid = (seconds: number, text: ReturnType<typeof useText>): string => {
  const distance = dayDistance(seconds);
  if (distance === 0) return text('COBALT.BANKING.PAID_TODAY');
  if (distance === 1) return text('COBALT.BANKING.PAID_YESTERDAY');
  return text('COBALT.BANKING.PAID_ON', {
    day: distance < 7 ? formatWeekday(seconds) : formatDayMonth(seconds),
  });
};

export const ChooseRecipient: React.FC<ChooseRecipientProps> = ({ from, accounts, onPick }) => {
  const text = useText();
  const [tab, setTab] = useState<Tab>('other');
  const [query, setQuery] = useState('');
  const [lookup, setLookup] = useState<Lookup>({ status: 'idle' });
  const [recent, setRecent] = useState<BankingRecipient[]>([]);
  const request = useRef(0);

  useEffect(() => {
    bankingApi.recentRecipients().then((result) => {
      if ('data' in result) setRecent(result.data);
    });
  }, []);

  const search = (value: string) => {
    const normalised = normaliseRecipient(value);
    const id = ++request.current;

    if (normalised.length < MIN_QUERY) {
      setLookup({ status: 'idle' });
      return;
    }

    setLookup({ status: 'searching', query: normalised });
    bankingApi.findRecipient(normalised).then((result) => {
      if (id !== request.current) return;
      setLookup(
        'data' in result
          ? { status: 'found', recipient: result.data }
          : { status: 'missing', query: value.trim() },
      );
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => search(query), LOOKUP_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  const describe = (recipient: BankingRecipient) =>
    text(`COBALT.BANKING.ACCOUNT_${recipient.type.toUpperCase()}`, {
      digits: endingDigits(recipient.accountId),
    });
  const own = accounts.filter((account) => account.accountId !== from.accountId);
  const missingQuery = 'query' in lookup && lookup.status === 'missing' ? lookup.query : null;
  const found = 'recipient' in lookup ? lookup.recipient : null;

  const tabLink = (value: Tab, label: string) => (
    <button
      type="button"
      aria-pressed={tab === value}
      onClick={() => setTab(value)}
      className={cn(
        'rounded text-sm leading-[18px]',
        FOCUS_RING,
        tab === value ? 'text-[#0F532A] underline' : 'text-[#555A55]',
      )}
    >
      {label}
    </button>
  );

  return (
    <FleecaPage>
      <SiteHeader />
      <ScreenTitle
        title={text('COBALT.BANKING.TRANSFER')}
        caption={text('COBALT.BANKING.STEP_TO')}
      />
      <div className="flex justify-center gap-5 px-4 pb-3.5">
        {tabLink('other', text('COBALT.BANKING.ANOTHER_PERSON'))}
        {tabLink('mine', text('COBALT.BANKING.MY_ACCOUNTS'))}
      </div>

      {tab === 'mine' ? (
        <div className="flex flex-col px-4">
          {own.map((account, index) => (
            <button
              key={account.accountId}
              type="button"
              onClick={() =>
                onPick({
                  accountId: account.accountId,
                  type: account.type,
                  name: account.name,
                  lastAt: null,
                })
              }
              className={cn(rowClass(index === 0), 'active:bg-[#DCDEDC]', FOCUS_RING)}
            >
              <CardThumb type={account.type} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[15px] leading-5">{account.name}</span>
                <span className="truncate text-xs leading-4 text-[#555A55]">
                  {text(`COBALT.BANKING.ROW_${account.type.toUpperCase()}`, {
                    digits: endingDigits(account.accountId),
                  })}
                </span>
              </span>
              <span className="shrink-0 text-[15px] tabular-nums leading-5">
                {formatMoney(account.balance)}
              </span>
            </button>
          ))}
          {own.length > 0 ? (
            <RowEnd />
          ) : (
            <p className="py-6 text-center text-sm text-[#555A55]">
              {text('COBALT.BANKING.NO_OTHER_ACCOUNTS')}
            </p>
          )}
        </div>
      ) : (
        <>
          <form
            className="flex flex-col gap-1.5 px-4"
            onSubmit={(event) => {
              event.preventDefault();
              search(query);
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] leading-[18px] text-[#555A55]">
                {text('COBALT.BANKING.RECIPIENT_LABEL')}
              </span>
              <input
                autoFocus
                name="recipient"
                autoComplete="off"
                spellCheck={false}
                maxLength={32}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-invalid={missingQuery !== null}
                className={cn(
                  'h-11 rounded-sm bg-[#F3F4F3] px-3 text-base uppercase tabular-nums tracking-[0.04em] outline-none',
                  missingQuery !== null
                    ? 'border-2 border-[#B03A34]'
                    : 'border border-[#8E938E] focus:border-[#2F9D46]',
                )}
              />
            </label>
          </form>

          {found && (
            <div className="flex flex-col items-center gap-2.5 px-4 pb-1.5 pt-4 text-center">
              <div>
                <p className="text-[15px] leading-5">{found.name}</p>
                <p className="text-[13px] leading-[18px] text-[#555A55]">{describe(found)}</p>
              </div>
              <FleecaButton onClick={() => onPick(found)}>
                {text('COBALT.BANKING.PAY_NAME', { name: found.name })}
              </FleecaButton>
            </div>
          )}

          {missingQuery !== null && (
            <div role="alert" className="flex flex-col gap-0.5 px-4 pb-1.5 pt-2.5">
              <p className="text-sm leading-5" style={{ color: DANGER }}>
                {text('COBALT.BANKING.RECIPIENT_MISSING', { query: missingQuery })}
              </p>
              <p className="text-[13px] leading-[18px] text-[#555A55]">
                {text('COBALT.BANKING.RECIPIENT_MISSING_HINT')}
              </p>
            </div>
          )}

          {recent.length > 0 && (
            <section className="flex flex-col px-4 pt-4">
              <ListLabel>{text('COBALT.BANKING.RECENT')}</ListLabel>
              {recent.map((entry, index) => (
                <button
                  key={entry.accountId}
                  type="button"
                  onClick={() => onPick(entry)}
                  className={cn(rowClass(index === 0), 'active:bg-[#DCDEDC]', FOCUS_RING)}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[15px] leading-5">{entry.name}</span>
                    <span className="truncate text-xs leading-4 text-[#555A55]">
                      {[describe(entry), entry.lastAt && lastPaid(entry.lastAt, text)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                </button>
              ))}
              <RowEnd />
            </section>
          )}
        </>
      )}
      <AdStrip
        image={posterAdvisor}
        imageClassName="h-16 w-14 object-[50%_35%]"
        title={text('COBALT.BANKING.AD_MEETING_TITLE')}
        body={text('COBALT.BANKING.AD_MEETING_BODY')}
      />
      {tab === 'other' && query && !found && missingQuery === null && (
        <TextLink className="mx-auto mt-3" onClick={() => search(query)}>
          {text('COBALT.BANKING.LOOK_UP')}
        </TextLink>
      )}
      <div className="h-4 shrink-0" />
    </FleecaPage>
  );
};
