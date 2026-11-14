import {
  BankingAccount,
  BankingAccountType,
  BankingDirection,
  BankingEntry,
  BankingFailure,
  BankingMember,
  BankingParty,
  BankingRecipient,
  BankingRole,
  BankingStatementPage,
  BankingTransferReceipt,
  BankingTransferRequest,
} from '@typings/banking';
import { mainLogger } from '../sv_logger';

export const bankingLogger = mainLogger.child({ module: 'banking' });

const RESOURCE = 'cobalt_banking';

type Row = Record<string, unknown>;

export type BridgeResult<T> = { ok: true; data: T } | { ok: false; reason: BankingFailure };

export interface MemberRoster {
  accountId: string;
  type: BankingAccountType;
  role: BankingRole;
  canManage: boolean;
  maxMembers: number;
  members: BankingMember[];
}

const ACCOUNT_TYPES: readonly BankingAccountType[] = ['personal', 'shared', 'society'];
const ROLES: readonly BankingRole[] = ['owner', 'admin', 'member', 'viewer'];
const FAILURES: readonly BankingFailure[] = [
  'invalid_amount',
  'not_found',
  'no_permission',
  'same_account',
  'insufficient_funds',
  'already_member',
  'member_limit',
];

const isRow = (value: unknown): value is Row =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const rows = (value: unknown): Row[] => (Array.isArray(value) ? value.filter(isRow) : []);

const text = (value: unknown): string | null => (typeof value === 'string' ? value : null);

const integer = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) ? value : null;

const oneOf = <T extends string>(options: readonly T[], value: unknown): T | null =>
  options.find((option) => option === value) ?? null;

const toAccount = (row: Row): BankingAccount | null => {
  const accountId = text(row.accountId);
  const type = oneOf(ACCOUNT_TYPES, row.type);
  const role = oneOf(ROLES, row.role);
  const balance = integer(row.balance);
  if (!accountId || !type || !role || balance === null) return null;

  return {
    accountId,
    type,
    role,
    balance,
    name: text(row.name) ?? accountId,
    primary: row.primary === true,
  };
};

const toParty = (value: unknown): BankingParty | null => {
  if (!isRow(value)) return null;
  const accountId = text(value.accountId);
  if (!accountId) return null;

  return { accountId, type: oneOf(ACCOUNT_TYPES, value.type), name: text(value.name) };
};

const toEntry = (row: Row): BankingEntry | null => {
  const id = integer(row.id);
  const accountId = text(row.accountId);
  const amount = integer(row.amount);
  const type = text(row.type);
  if (id === null || !accountId || amount === null || !type) return null;

  const initiator = isRow(row.initiator) ? row.initiator : null;
  const initiatorId = initiator && text(initiator.citizenid);
  const initiatorName = initiator && text(initiator.name);

  return {
    id,
    accountId,
    type,
    amount,
    note: text(row.note),
    balanceAfter: integer(row.balanceAfter),
    receipt: text(row.receipt),
    counterparty: toParty(row.counterparty),
    initiator:
      initiatorId && initiatorName ? { citizenid: initiatorId, name: initiatorName } : null,
    createdAt: integer(row.createdAt) ?? 0,
  };
};

const toRecipient = (value: unknown): BankingRecipient | null => {
  if (!isRow(value)) return null;
  const accountId = text(value.accountId);
  const type = oneOf(ACCOUNT_TYPES, value.type);
  if (!accountId || !type) return null;

  return { accountId, type, name: text(value.name) ?? accountId, lastAt: integer(value.lastAt) };
};

const toMember = (row: Row): BankingMember | null => {
  const citizenid = text(row.citizenid);
  const role = oneOf(ROLES, row.role);
  if (!citizenid || !role) return null;

  return { citizenid, role, name: text(row.name)?.trim() || citizenid, rank: text(row.rank) };
};

const present = <T>(value: T | null): value is T => value !== null;

const refusal = (value: unknown): BankingFailure =>
  (isRow(value) && oneOf(FAILURES, value.reason)) || 'unavailable';

export const isBankingAvailable = (): boolean => GetResourceState(RESOURCE) === 'started';

const call = (name: string, ...args: unknown[]): unknown => global.exports[RESOURCE][name](...args);

const guarded = <T>(read: () => BridgeResult<T>): BridgeResult<T> => {
  if (!isBankingAvailable()) return { ok: false, reason: 'unavailable' };

  try {
    return read();
  } catch (error) {
    bankingLogger.error(
      `cobalt_banking export failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { ok: false, reason: 'unavailable' };
  }
};

export const BankingBridge = {
  accounts: (citizenid: string): BridgeResult<BankingAccount[]> =>
    guarded(() => ({
      ok: true,
      data: rows(call('GetAccessibleAccounts', citizenid)).map(toAccount).filter(present),
    })),

  statement: (
    citizenid: string,
    accountId: string,
    direction: BankingDirection,
    before?: number,
  ): BridgeResult<BankingStatementPage> =>
    guarded(() => {
      const page = call('GetStatement', citizenid, accountId, { direction, before, limit: 20 });
      if (!isRow(page) || page.ok !== true) return { ok: false, reason: refusal(page) };

      return {
        ok: true,
        data: {
          entries: rows(page.entries).map(toEntry).filter(present),
          nextCursor: integer(page.nextCursor),
        },
      };
    }),

  entry: (citizenid: string, transactionId: number): BridgeResult<BankingEntry> =>
    guarded(() => {
      const result = call('GetStatementEntry', citizenid, transactionId);
      const entry =
        isRow(result) && result.ok === true && isRow(result.entry) ? toEntry(result.entry) : null;

      return entry ? { ok: true, data: entry } : { ok: false, reason: refusal(result) };
    }),

  findRecipient: (query: string): BridgeResult<BankingRecipient> =>
    guarded(() => {
      const recipient = toRecipient(call('FindRecipient', query));
      return recipient ? { ok: true, data: recipient } : { ok: false, reason: 'not_found' };
    }),

  recentRecipients: (citizenid: string): BridgeResult<BankingRecipient[]> =>
    guarded(() => {
      const recipients = call('GetRecentRecipients', citizenid, 5);
      return {
        ok: true,
        data: (Array.isArray(recipients) ? recipients : []).map(toRecipient).filter(present),
      };
    }),

  transfer: (
    citizenid: string,
    request: BankingTransferRequest,
  ): BridgeResult<BankingTransferReceipt> =>
    guarded(() => {
      const result = call('SendTransfer', citizenid, request);
      if (!isRow(result) || result.ok !== true) return { ok: false, reason: refusal(result) };

      const balance = integer(result.balance);
      const transactionId = integer(result.transactionId);
      const receipt = text(result.receipt);
      const toAccountId = text(result.toAccountId);
      if (balance === null || transactionId === null || !receipt || !toAccountId) {
        return { ok: false, reason: 'unavailable' };
      }

      return {
        ok: true,
        data: { balance, transactionId, receipt, toAccountId, fee: integer(result.fee) ?? 0 },
      };
    }),

  members: (citizenid: string, accountId: string): BridgeResult<MemberRoster> =>
    guarded(() => {
      const result = call('GetAccountMembers', citizenid, accountId);
      if (!isRow(result) || result.ok !== true) return { ok: false, reason: refusal(result) };

      const type = oneOf(ACCOUNT_TYPES, result.type);
      const role = oneOf(ROLES, result.role);
      if (!type || !role) return { ok: false, reason: 'unavailable' };

      return {
        ok: true,
        data: {
          accountId,
          type,
          role,
          canManage: result.canManage === true,
          maxMembers: integer(result.maxMembers) ?? 0,
          members: rows(result.members).map(toMember).filter(present),
        },
      };
    }),

  invite: (citizenid: string, accountId: string, target: string): BridgeResult<BankingMember> =>
    guarded(() => {
      const result = call('InviteMember', citizenid, accountId, target);
      const member =
        isRow(result) && result.ok === true && isRow(result.member)
          ? toMember(result.member)
          : null;

      return member ? { ok: true, data: member } : { ok: false, reason: refusal(result) };
    }),

  revoke: (citizenid: string, accountId: string, target: string): BridgeResult<null> =>
    guarded(() => {
      const result = call('RevokeMember', citizenid, accountId, target);
      return isRow(result) && result.ok === true
        ? { ok: true, data: null }
        : { ok: false, reason: refusal(result) };
    }),
};
