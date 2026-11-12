import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { BankingAccount } from '@typings/banking';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { cn } from '@utils/css';
import { useText } from '@apps/gallery/hooks/useText';
import billboard from '../assets/billboard.jpg';
import { bankingApi } from '../hooks/bankingApi';
import { useAccountsState, useLoadAccounts } from '../hooks/state';
import { endingDigits, formatMoney } from '../utils/format';
import { BranchNotice } from './BranchNotice';
import {
  CardThumb,
  FinePrint,
  FleecaButton,
  FleecaPage,
  FOCUS_RING,
  ListLabel,
  roleLabelKey,
  rowClass,
  RowEnd,
  SiteHeader,
  TextLink,
} from './parts';

const AccountRow: React.FC<{ account: BankingAccount; first: boolean; onOpen: () => void }> = ({
  account,
  first,
  onOpen,
}) => {
  const text = useText();
  const roleKey = roleLabelKey(account.type, account.role);
  const meta = [
    text(`COBALT.BANKING.ROW_${account.type.toUpperCase()}`, {
      digits: endingDigits(account.accountId),
    }),
    roleKey && text(roleKey),
    account.frozen && text('COBALT.BANKING.FROZEN'),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(rowClass(first), 'active:bg-[#DCDEDC]', FOCUS_RING)}
    >
      <CardThumb type={account.type} />
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-[15px] leading-5">{account.name}</span>
        <span className="truncate text-xs leading-4 text-[#555A55]">{meta}</span>
      </span>
      <span className="shrink-0 text-[15px] tabular-nums leading-5">
        {formatMoney(account.balance)}
      </span>
    </button>
  );
};

export const AccountsHome: React.FC = () => {
  const history = useHistory();
  const text = useText();
  const { addAlert } = useSnackbar();
  const { status, holder, accounts } = useAccountsState();
  const loadAccounts = useLoadAccounts();
  const [retrying, setRetrying] = useState(false);
  const [locating, setLocating] = useState(false);

  const retry = async () => {
    setRetrying(true);
    await loadAccounts();
    setRetrying(false);
  };

  const findCashPoint = async () => {
    setLocating(true);
    const result = await bankingApi.markCashPoint();
    setLocating(false);
    addAlert(
      'data' in result
        ? {
            type: 'success',
            message: text('COBALT.BANKING.WAYPOINT_SET', { place: result.data.label }),
          }
        : { type: 'info', message: text('COBALT.BANKING.NO_CASH_POINT') },
    );
  };

  if (status === 'error') {
    return (
      <BranchNotice
        title={text('COBALT.BANKING.LOAD_FAILED')}
        caption={text('COBALT.BANKING.LOAD_FAILED_CAPTION')}
        retrying={retrying}
        onRetry={retry}
      />
    );
  }

  const ownMoney = accounts.filter((account) => account.type !== 'society');
  const total = ownMoney.reduce((sum, account) => sum + account.balance, 0);
  const groupAccounts = accounts.some((account) => account.type !== 'personal');
  const open = (account: BankingAccount) =>
    history.push(`/banking/account/${encodeURIComponent(account.accountId)}`);

  return (
    <FleecaPage>
      <SiteHeader />
      <div className="flex items-baseline px-4 pb-2 pt-3">
        <p className="min-w-0 flex-1 truncate text-[17px] leading-[22px]">
          {holder
            ? text('COBALT.BANKING.WELCOME_NAME', { name: holder })
            : text('COBALT.BANKING.WELCOME')}
        </p>
        <p className="text-[17px] tabular-nums leading-[22px]">
          {status === 'ready' ? formatMoney(total) : ''}
        </p>
      </div>
      <div className="px-4">
        <img
          src={billboard}
          alt={text('COBALT.BANKING.BILLBOARD_ALT')}
          className="h-[150px] w-full border border-[#C3C7C3] object-cover"
        />
      </div>
      <section className="flex flex-col px-4 pt-2.5">
        <ListLabel>{text('COBALT.BANKING.YOUR_ACCOUNTS')}</ListLabel>
        {status !== 'ready' && (
          <p className="py-4 text-center text-[13px] text-[#555A55]">
            {text('COBALT.BANKING.LOADING')}
          </p>
        )}
        {accounts.map((account, index) => (
          <AccountRow
            key={account.accountId}
            account={account}
            first={index === 0}
            onOpen={() => open(account)}
          />
        ))}
        {status === 'ready' && !groupAccounts && (
          <div className="flex flex-col items-center gap-1 border-t border-[#C3C7C3] px-2 py-4 text-center">
            <p className="text-[15px] leading-5">{text('COBALT.BANKING.NO_GROUP_ACCOUNTS')}</p>
            <p className="text-[13px] leading-[18px] text-[#555A55]">
              {text('COBALT.BANKING.NO_GROUP_ACCOUNTS_CAPTION')}
            </p>
          </div>
        )}
        {accounts.length > 0 && <RowEnd />}
      </section>
      {status === 'ready' && (
        <div className="flex flex-col items-center gap-2 px-4 pt-3.5">
          <FleecaButton onClick={() => history.push('/banking/transfer')}>
            {text('COBALT.BANKING.TRANSFER')}
          </FleecaButton>
          <TextLink disabled={locating} onClick={findCashPoint}>
            {text('COBALT.BANKING.FIND_ATM')}
          </TextLink>
        </div>
      )}
      <FinePrint>{text('COBALT.BANKING.FDIC')}</FinePrint>
    </FleecaPage>
  );
};
