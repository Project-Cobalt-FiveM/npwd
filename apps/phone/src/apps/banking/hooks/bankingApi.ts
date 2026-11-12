import {
  BankingCashPoint,
  BankingDirection,
  BankingEntry,
  BankingEvents,
  BankingFailure,
  BankingMember,
  BankingMemberList,
  BankingOverview,
  BankingRecipient,
  BankingStatementPage,
  BankingTransferReceipt,
  BankingTransferRequest,
} from '@typings/banking';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { buildRespObj } from '@utils/misc';
import {
  MockAccounts,
  MockEntries,
  MockMembers,
  MockReceipt,
  MockRecipient,
  MockRecipients,
  MockStatement,
} from '../utils/mocks';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; reason: BankingFailure };

const FAILURES: readonly BankingFailure[] = [
  'invalid_amount',
  'not_found',
  'no_permission',
  'same_account',
  'insufficient_funds',
  'account_frozen',
  'recipient_frozen',
  'already_member',
  'member_limit',
  'unavailable',
];

const toFailure = (value: unknown): BankingFailure =>
  FAILURES.find((failure) => failure === value) ?? 'unavailable';

const request = async <T, D = unknown>(
  event: BankingEvents,
  data: D,
  mock: T,
): Promise<ApiResult<T>> => {
  try {
    const resp = await fetchNui<ServerPromiseResp<T>, D>(event, data, buildRespObj(mock, 'ok'));
    return resp?.status === 'ok'
      ? { ok: true, data: resp.data as T }
      : { ok: false, reason: toFailure(resp?.errorMsg) };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
};

export const bankingApi = {
  accounts: () =>
    request<BankingOverview, void>(BankingEvents.FETCH_ACCOUNTS, undefined, {
      holder: 'Ava Morales',
      accounts: MockAccounts,
    }),

  statement: (accountId: string, direction: BankingDirection, before?: number) =>
    request<BankingStatementPage>(
      BankingEvents.FETCH_STATEMENT,
      { accountId, direction, before },
      {
        ...MockStatement,
        entries: MockEntries.filter(
          (entry) =>
            direction === 'all' || (direction === 'in' ? entry.amount > 0 : entry.amount < 0),
        ),
      },
    ),

  entry: (transactionId: number) =>
    request<BankingEntry, number>(
      BankingEvents.FETCH_ENTRY,
      transactionId,
      MockEntries.find((entry) => entry.id === transactionId) ?? MockEntries[0],
    ),

  findRecipient: (query: string) =>
    request<BankingRecipient, string>(BankingEvents.FIND_RECIPIENT, query, {
      ...MockRecipient,
      accountId: query,
    }),

  recentRecipients: () =>
    request<BankingRecipient[], void>(
      BankingEvents.FETCH_RECENT_RECIPIENTS,
      undefined,
      MockRecipients,
    ),

  transfer: (transfer: BankingTransferRequest) =>
    request<BankingTransferReceipt, BankingTransferRequest>(
      BankingEvents.SEND_TRANSFER,
      transfer,
      MockReceipt,
    ),

  members: (accountId: string) =>
    request<BankingMemberList, string>(BankingEvents.FETCH_MEMBERS, accountId, {
      ...MockMembers,
      accountId,
    }),

  invite: (accountId: string, citizenid: string) =>
    request<BankingMember>(
      BankingEvents.INVITE_MEMBER,
      { accountId, citizenid },
      { citizenid, name: citizenid, role: 'member', rank: null },
    ),

  revoke: (accountId: string, citizenid: string) =>
    request<null>(BankingEvents.REVOKE_MEMBER, { accountId, citizenid }, null),

  markCashPoint: () =>
    request<BankingCashPoint, void>(BankingEvents.MARK_CASH_POINT, undefined, {
      label: 'ATM',
      atm: true,
    }),
};
