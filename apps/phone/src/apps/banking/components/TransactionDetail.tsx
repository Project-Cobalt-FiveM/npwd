import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { BankingEntry } from '@typings/banking';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { setClipboard } from '@os/phone/hooks/useClipboard';
import { useText } from '@apps/gallery/hooks/useText';
import { bankingApi } from '../hooks/bankingApi';
import { useAccount } from '../hooks/state';
import { endingDigits, formatFullDate, formatSigned } from '../utils/format';
import { entryTitle } from './EntryRow';
import {
  canSend,
  DetailRow,
  FinePrint,
  FleecaButton,
  FleecaPage,
  RowEnd,
  ScreenTitle,
  SiteHeader,
  TextLink,
} from './parts';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; entry: BankingEntry };

export const TransactionDetail: React.FC = () => {
  const { entryId } = useParams<{ entryId: string }>();
  const history = useHistory();
  const text = useText();
  const { addAlert } = useSnackbar();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const entry = 'entry' in state ? state.entry : null;
  const account = useAccount(entry?.accountId ?? '');

  useEffect(() => {
    let active = true;
    bankingApi.entry(Number(entryId)).then((result) => {
      if (active)
        setState('data' in result ? { status: 'ready', entry: result.data } : { status: 'error' });
    });
    return () => {
      active = false;
    };
  }, [entryId]);

  if (!entry) {
    return (
      <FleecaPage>
        <SiteHeader />
        <ScreenTitle
          title={text('COBALT.BANKING.TRANSACTION')}
          caption={text(
            state.status === 'error' ? 'COBALT.BANKING.ENTRY_FAILED' : 'COBALT.BANKING.LOADING',
          )}
        />
      </FleecaPage>
    );
  }

  const outgoing = entry.amount < 0;
  const party = entry.counterparty;
  const accountName = account?.name ?? endingDigits(entry.accountId);
  const resend = entry.type === 'transfer_out' && party && account && canSend(account);

  const copyReference = () => {
    if (!entry.receipt) return;
    setClipboard(entry.receipt);
    addAlert({ type: 'success', message: text('COBALT.BANKING.REFERENCE_COPIED') });
  };

  const sendAgain = () =>
    history.push(
      `/banking/transfer?from=${encodeURIComponent(entry.accountId)}&to=${encodeURIComponent(
        party.accountId,
      )}&amount=${Math.abs(entry.amount)}`,
    );

  return (
    <FleecaPage>
      <SiteHeader />
      <ScreenTitle
        title={text('COBALT.BANKING.TRANSACTION')}
        caption={text(outgoing ? 'COBALT.BANKING.MONEY_OUT_OF' : 'COBALT.BANKING.MONEY_INTO', {
          name: accountName,
        })}
      />
      <div className="flex flex-col items-center pb-4 pt-1.5">
        <p className="text-[40px] tabular-nums leading-[48px]">{formatSigned(entry.amount)}</p>
        <p className="text-sm leading-5 text-[#555A55]">
          {party?.name
            ? text(outgoing ? 'COBALT.BANKING.TO_NAME' : 'COBALT.BANKING.FROM_NAME', {
                name: party.name,
              })
            : entryTitle(entry, text)}
        </p>
      </div>
      <div className="flex flex-col px-4">
        <DetailRow first label={text('COBALT.BANKING.DATE')}>
          {formatFullDate(entry.createdAt)}
        </DetailRow>
        {party && (
          <DetailRow label={text(outgoing ? 'COBALT.BANKING.TO' : 'COBALT.BANKING.FROM')}>
            {text('COBALT.BANKING.NAME_ENDING', {
              name: party.name ?? '',
              digits: endingDigits(party.accountId),
            })}
          </DetailRow>
        )}
        <DetailRow label={text('COBALT.BANKING.ACCOUNT')}>
          {text('COBALT.BANKING.NAME_ENDING', {
            name: accountName,
            digits: endingDigits(entry.accountId),
          })}
        </DetailRow>
        {entry.receipt && (
          <DetailRow label={text('COBALT.BANKING.REFERENCE')}>{entry.receipt}</DetailRow>
        )}
        {entry.initiator && (
          <DetailRow label={text('COBALT.BANKING.MADE_BY')}>{entry.initiator.name}</DetailRow>
        )}
        {entry.note && <DetailRow label={text('COBALT.BANKING.NOTE')}>{entry.note}</DetailRow>}
        <RowEnd />
      </div>
      <div className="flex flex-col items-center gap-3 px-4 pt-[22px]">
        {resend && (
          <FleecaButton onClick={sendAgain}>{text('COBALT.BANKING.SEND_AGAIN')}</FleecaButton>
        )}
        {entry.receipt && (
          <TextLink onClick={copyReference}>{text('COBALT.BANKING.COPY_REFERENCE')}</TextLink>
        )}
      </div>
      <FinePrint>{text('COBALT.BANKING.AD_OVERDRAFT')}</FinePrint>
    </FleecaPage>
  );
};
