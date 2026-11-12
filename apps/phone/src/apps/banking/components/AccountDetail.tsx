import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { BankingDirection } from '@typings/banking';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { setClipboard } from '@os/phone/hooks/useClipboard';
import { cn } from '@utils/css';
import { useText } from '@apps/gallery/hooks/useText';
import printAd from '../assets/print-ad.jpg';
import posterMoney from '../assets/poster-money.jpg';
import { useAccount } from '../hooks/state';
import { useStatement } from '../hooks/useStatement';
import { accountDigits, formatMoney } from '../utils/format';
import { EntryRow } from './EntryRow';
import {
  AdStrip,
  canSend,
  CardArt,
  FleecaButton,
  FleecaPage,
  FOCUS_RING,
  RowEnd,
  ScreenTitle,
  SiteHeader,
  TextLink,
} from './parts';

const DIRECTIONS: BankingDirection[] = ['all', 'in', 'out'];

export const AccountDetail: React.FC = () => {
  const { accountId: rawId } = useParams<{ accountId: string }>();
  const accountId = decodeURIComponent(rawId);
  const account = useAccount(accountId);
  const history = useHistory();
  const text = useText();
  const { addAlert } = useSnackbar();
  const [direction, setDirection] = useState<BankingDirection>('all');
  const statement = useStatement(accountId, direction);

  if (!account) {
    return (
      <FleecaPage>
        <SiteHeader />
        <ScreenTitle
          title={text('COBALT.BANKING.ACCOUNT_GONE')}
          caption={text('COBALT.BANKING.ACCOUNT_GONE_CAPTION')}
        />
      </FleecaPage>
    );
  }

  const copyNumber = () => {
    setClipboard(account.accountId);
    addAlert({ type: 'success', message: text('COBALT.BANKING.NUMBER_COPIED') });
  };

  const empty =
    statement.status === 'ready' && statement.entries.length === 0 && direction === 'all';
  const transfer = () => history.push(`/banking/transfer?from=${encodeURIComponent(accountId)}`);
  const moveIn = () => history.push(`/banking/transfer?to=${encodeURIComponent(accountId)}`);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 120) statement.loadMore();
  };

  return (
    <FleecaPage>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" onScroll={onScroll}>
        <SiteHeader />
        <div className="flex flex-col items-center gap-2 px-4 pb-0.5 pt-3.5 text-center">
          <h1 className="text-lg font-normal leading-6">{account.name}</h1>
          <CardArt className="h-[126px] w-[200px]" />
          <p className="pt-1 text-[26px] tabular-nums leading-8">{formatMoney(account.balance)}</p>
          <p className="text-xs leading-4 text-[#555A55]">
            {text(`COBALT.BANKING.DETAIL_${account.type.toUpperCase()}`, {
              digits: accountDigits(account.accountId),
            })}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2.5 px-4 pb-1.5 pt-3.5">
          {canSend(account) && (
            <FleecaButton onClick={empty ? moveIn : transfer}>
              {text(empty ? 'COBALT.BANKING.MOVE_MONEY_IN' : 'COBALT.BANKING.TRANSFER')}
            </FleecaButton>
          )}
          <div className="flex gap-[18px]">
            {account.type !== 'personal' && (
              <TextLink
                onClick={() =>
                  history.push(`/banking/account/${encodeURIComponent(accountId)}/members`)
                }
              >
                {text('COBALT.BANKING.VIEW_MEMBERS')}
              </TextLink>
            )}
            <TextLink onClick={copyNumber}>{text('COBALT.BANKING.COPY_NUMBER')}</TextLink>
          </div>
        </div>
        <section className="flex flex-col px-4 pt-3">
          <div className="flex items-baseline pb-1.5">
            <h2 className="flex-1 text-base font-normal leading-[22px]">
              {text('COBALT.BANKING.HISTORY')}
            </h2>
            {!empty && (
              <div className="flex gap-3 text-[13px] leading-[18px]">
                {DIRECTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={direction === value}
                    onClick={() => setDirection(value)}
                    className={cn(
                      'rounded',
                      FOCUS_RING,
                      direction === value ? 'text-[#0F532A] underline' : 'text-[#555A55]',
                    )}
                  >
                    {text(`COBALT.BANKING.FILTER_${value.toUpperCase()}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {empty ? (
            <div className="flex items-center gap-3.5 border-y border-b-[#C3C7C3] border-t-[#2F9D46] py-[18px]">
              <img
                src={posterMoney}
                alt=""
                className="h-[130px] w-24 shrink-0 border border-[#C3C7C3] object-cover object-[50%_40%]"
              />
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-base leading-[22px]">{text('COBALT.BANKING.NO_TRANSACTIONS')}</p>
                <p className="text-[13px] leading-[18px] text-[#555A55]">
                  {text('COBALT.BANKING.NO_TRANSACTIONS_CAPTION')}
                </p>
                <p className="text-xs font-bold leading-4 text-[#1B9339]">
                  {text('COBALT.BANKING.MONEY_FOR_NOTHING')}
                </p>
              </div>
            </div>
          ) : (
            <>
              {statement.status === 'error' && (
                <p className="py-6 text-center text-sm text-[#555A55]">
                  {text('COBALT.BANKING.HISTORY_FAILED')}
                </p>
              )}
              {statement.status === 'ready' && statement.entries.length === 0 && (
                <p className="py-6 text-center text-sm text-[#555A55]">
                  {text(direction === 'in' ? 'COBALT.BANKING.NONE_IN' : 'COBALT.BANKING.NONE_OUT')}
                </p>
              )}
              {statement.entries.map((entry, index) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  first={index === 0}
                  onOpen={() => history.push(`/banking/entry/${entry.id}`)}
                />
              ))}
              {statement.entries.length > 0 && <RowEnd />}
              {statement.loadingMore && (
                <p className="py-3 text-center text-xs text-[#555A55]">
                  {text('COBALT.BANKING.LOADING')}
                </p>
              )}
            </>
          )}
        </section>
        <AdStrip
          image={printAd}
          imageClassName="object-[80%_70%]"
          title={text('COBALT.BANKING.AD_CHECKING_TITLE')}
          body={text('COBALT.BANKING.AD_CHECKING_BODY')}
        />
        <div className="h-4 shrink-0" />
      </div>
    </FleecaPage>
  );
};
