import { useCallback } from 'react';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { BankingAccount, BankingBalanceChange } from '@typings/banking';
import { bankingApi } from './bankingApi';

export type AccountsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AccountsState {
  status: AccountsStatus;
  holder: string | null;
  accounts: BankingAccount[];
}

const accountsState = atom<AccountsState>({
  key: 'bankingAccounts',
  default: { status: 'idle', holder: null, accounts: [] },
});

const balanceRevision = atom<Record<string, number>>({
  key: 'bankingBalanceRevision',
  default: {},
});

export const useAccountsState = () => useRecoilValue(accountsState);

export const useAccount = (accountId: string): BankingAccount | undefined =>
  useRecoilValue(accountsState).accounts.find((account) => account.accountId === accountId);

export const useAccountRevision = (accountId: string): number =>
  useRecoilValue(balanceRevision)[accountId] ?? 0;

export const useLoadAccounts = () => {
  const setState = useSetRecoilState(accountsState);

  return useCallback(async () => {
    setState((current) => ({
      ...current,
      status: current.status === 'ready' ? 'ready' : 'loading',
    }));
    const result = await bankingApi.accounts();
    setState((current) =>
      'data' in result
        ? { status: 'ready', holder: result.data.holder, accounts: result.data.accounts }
        : { ...current, status: current.status === 'ready' ? 'ready' : 'error' },
    );
    return 'data' in result;
  }, [setState]);
};

export const useApplyBalanceChange = () => {
  const setAccounts = useSetRecoilState(accountsState);
  const setRevision = useSetRecoilState(balanceRevision);

  return useCallback(
    ({ accountId, balance }: BankingBalanceChange) => {
      setAccounts((current) => ({
        ...current,
        accounts: current.accounts.map((account) =>
          account.accountId === accountId ? { ...account, balance } : account,
        ),
      }));
      setRevision((current) => ({ ...current, [accountId]: (current[accountId] ?? 0) + 1 }));
    },
    [setAccounts, setRevision],
  );
};
