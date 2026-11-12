import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { BankingRecipient, BankingTransferReceipt } from '@typings/banking';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useText } from '@apps/gallery/hooks/useText';
import { bankingApi } from '../../hooks/bankingApi';
import { useAccountsState } from '../../hooks/state';
import { canSend, failureKey } from '../parts';
import { ChooseAccount } from './ChooseAccount';
import { ChooseRecipient } from './ChooseRecipient';
import { EnterAmount } from './EnterAmount';
import { ReviewTransfer } from './ReviewTransfer';
import { TransferSuccess } from './TransferSuccess';

export type TransferStep = 'from' | 'to' | 'amount' | 'confirm' | 'success';

const STEPS: TransferStep[] = ['from', 'to', 'amount', 'confirm', 'success'];

export const TransferFlow: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const text = useText();
  const { addAlert } = useSnackbar();
  const { accounts } = useAccountsState();
  const initial = useMemo(() => new URLSearchParams(location.search), []);
  const depth = useRef(0);

  const [fromId, setFromId] = useState<string | null>(() => {
    const preset = accounts.find((account) => account.accountId === initial.get('from'));
    return preset && canSend(preset) ? preset.accountId : null;
  });
  const [recipient, setRecipient] = useState<BankingRecipient | null>(null);
  const [amount, setAmount] = useState(() =>
    /^\d{1,9}$/.test(initial.get('amount') ?? '') ? initial.get('amount') : '',
  );
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<BankingTransferReceipt | null>(null);

  const params = new URLSearchParams(location.search);
  const step = STEPS.find((value) => value === params.get('step')) ?? null;
  const from = accounts.find((account) => account.accountId === fromId) ?? null;

  const urlFor = (next: TransferStep) => {
    const search = new URLSearchParams(location.search);
    search.set('step', next);
    return `${location.pathname}?${search.toString()}`;
  };

  const go = (next: TransferStep) => {
    depth.current += 1;
    history.push(urlFor(next));
  };

  const exit = useCallback(() => history.go(-(depth.current + 1)), [history]);

  useEffect(() => {
    if (step) return;
    const presetTo = initial.get('to');
    const own = accounts.find((account) => account.accountId === presetTo);

    if (own)
      setRecipient({ accountId: own.accountId, type: own.type, name: own.name, lastAt: null });
    if (presetTo && !own && fromId) {
      bankingApi.findRecipient(presetTo).then((result) => {
        if ('data' in result) {
          setRecipient(result.data);
          history.replace(urlFor('amount'));
        } else {
          history.replace(urlFor('to'));
        }
      });
      return;
    }

    history.replace(urlFor(!fromId ? 'from' : own ? 'amount' : 'to'));
  }, [step]);

  useEffect(() => {
    if (receipt && step !== 'success') exit();
  }, [step]);

  const pickFrom = (accountId: string) => {
    setFromId(accountId);
    go(recipient && recipient.accountId !== accountId ? 'amount' : 'to');
  };

  const pickRecipient = (next: BankingRecipient) => {
    setRecipient(next);
    go('amount');
  };

  const send = async () => {
    if (!from || !recipient || sending) return;
    setSending(true);
    const result = await bankingApi.transfer({
      from: from.accountId,
      to: recipient.accountId,
      amount: Number(amount),
      note: note.trim() || undefined,
    });
    setSending(false);

    if ('reason' in result) {
      addAlert({ type: 'error', message: text(failureKey(result.reason)) });
      if (result.reason === 'insufficient_funds') history.goBack();
      return;
    }

    setReceipt(result.data);
    history.replace(urlFor('success'));
  };

  if (!step) return null;

  if (step === 'from' || !from) {
    return (
      <ChooseAccount
        accounts={accounts}
        excludeId={recipient?.accountId ?? null}
        selectedId={fromId}
        onPick={pickFrom}
      />
    );
  }

  if (step === 'to' || !recipient) {
    return <ChooseRecipient from={from} accounts={accounts} onPick={pickRecipient} />;
  }

  if (step === 'amount') {
    return (
      <EnterAmount
        from={from}
        recipient={recipient}
        amount={amount}
        note={note}
        onAmount={setAmount}
        onNote={setNote}
        onChangeAccount={() => go('from')}
        onReview={() => go('confirm')}
      />
    );
  }

  if (step === 'confirm') {
    return (
      <ReviewTransfer
        from={from}
        recipient={recipient}
        amount={Number(amount)}
        note={note.trim()}
        sending={sending}
        onEdit={() => history.goBack()}
        onSend={send}
      />
    );
  }

  if (!receipt) return null;

  return (
    <TransferSuccess
      from={from}
      recipient={recipient}
      amount={Number(amount)}
      note={note.trim()}
      receipt={receipt}
      onDone={exit}
      onReceipt={() => receipt && history.replace(`/banking/entry/${receipt.transactionId}`)}
    />
  );
};
