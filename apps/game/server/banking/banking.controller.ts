import {
  BankingAccount,
  BankingBalanceChange,
  BankingDirection,
  BankingEntry,
  BankingEvents,
  BankingMember,
  BankingMemberChange,
  BankingMemberList,
  BankingOverview,
  BankingRecipient,
  BankingStatementPage,
  BankingStatementQuery,
  BankingTransferReceipt,
  BankingTransferRequest,
} from '@typings/banking';
import { ServerPromiseResp } from '@typings/common';
import PlayerService from '../players/player.service';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { getSource } from '../utils/miscUtils';
import { BankingBridge, BridgeResult } from './banking.bridge';

const watchedAccounts = new Map<number, Set<string>>();

const watch = (source: number, accounts: BankingAccount[]): void => {
  watchedAccounts.set(source, new Set(accounts.map((account) => account.accountId)));
};

const reply = <T>(resp: PromiseEventResp<T>, result: BridgeResult<T>): void => {
  resp(
    'reason' in result
      ? { status: 'error', errorMsg: result.reason }
      : { status: 'ok', data: result.data },
  );
};

const citizenOf = (source: number): string | null =>
  PlayerService.getPlayer(source)?.getIdentifier() ?? null;

const withCitizen =
  <T, P>(handler: (citizenid: string, data: T, source: number) => BridgeResult<P>) =>
  (req: PromiseRequest<T>, resp: (data: ServerPromiseResp<P>) => void): void => {
    const citizenid = citizenOf(req.source);
    if (!citizenid) return resp({ status: 'error', errorMsg: 'unavailable' });

    reply(resp, handler(citizenid, req.data, req.source));
  };

const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const DIRECTIONS: readonly BankingDirection[] = ['all', 'in', 'out'];

const toDirection = (value: unknown): BankingDirection =>
  DIRECTIONS.find((direction) => direction === value) ?? 'all';

onNetPromise<void, BankingOverview>(
  BankingEvents.FETCH_ACCOUNTS,
  withCitizen((citizenid, _data, source) => {
    const result = BankingBridge.accounts(citizenid);
    if ('reason' in result) return result;

    watch(source, result.data);
    return {
      ok: true,
      data: { holder: PlayerService.getPlayer(source)?.getName() ?? null, accounts: result.data },
    };
  }),
);

onNetPromise<BankingStatementQuery, BankingStatementPage>(
  BankingEvents.FETCH_STATEMENT,
  withCitizen((citizenid, query) => {
    if (!isText(query?.accountId)) return { ok: false, reason: 'not_found' };
    const before = Number.isInteger(query.before) ? query.before : undefined;
    return BankingBridge.statement(
      citizenid,
      query.accountId,
      toDirection(query.direction),
      before,
    );
  }),
);

onNetPromise<number, BankingEntry>(
  BankingEvents.FETCH_ENTRY,
  withCitizen((citizenid, transactionId) =>
    Number.isInteger(transactionId)
      ? BankingBridge.entry(citizenid, transactionId)
      : { ok: false, reason: 'not_found' },
  ),
);

onNetPromise<string, BankingRecipient>(
  BankingEvents.FIND_RECIPIENT,
  withCitizen((_citizenid, query) =>
    isText(query) ? BankingBridge.findRecipient(query) : { ok: false, reason: 'not_found' },
  ),
);

onNetPromise<void, BankingRecipient[]>(
  BankingEvents.FETCH_RECENT_RECIPIENTS,
  withCitizen((citizenid) => BankingBridge.recentRecipients(citizenid)),
);

onNetPromise<BankingTransferRequest, BankingTransferReceipt>(
  BankingEvents.SEND_TRANSFER,
  withCitizen((citizenid, request) => {
    if (!isText(request?.from) || !isText(request?.to) || !Number.isInteger(request.amount)) {
      return { ok: false, reason: 'invalid_amount' };
    }

    const note = typeof request.note === 'string' ? request.note.trim().slice(0, 60) : '';

    return BankingBridge.transfer(citizenid, {
      from: request.from,
      to: request.to.trim(),
      amount: request.amount,
      note: note || undefined,
    });
  }),
  { rateLimit: 1000 },
);

onNetPromise<string, BankingMemberList>(
  BankingEvents.FETCH_MEMBERS,
  withCitizen((citizenid, accountId) => {
    if (!isText(accountId)) return { ok: false, reason: 'not_found' };
    const result = BankingBridge.members(citizenid, accountId);
    return result.ok ? { ok: true, data: { ...result.data, selfCitizenid: citizenid } } : result;
  }),
);

onNetPromise<BankingMemberChange, BankingMember>(
  BankingEvents.INVITE_MEMBER,
  withCitizen((citizenid, change) =>
    isText(change?.accountId) && isText(change?.citizenid)
      ? BankingBridge.invite(citizenid, change.accountId, change.citizenid.trim())
      : { ok: false, reason: 'not_found' },
  ),
);

onNetPromise<BankingMemberChange, null>(
  BankingEvents.REVOKE_MEMBER,
  withCitizen((citizenid, change) =>
    isText(change?.accountId) && isText(change?.citizenid)
      ? BankingBridge.revoke(citizenid, change.accountId, change.citizenid)
      : { ok: false, reason: 'not_found' },
  ),
);

on('cobalt_banking:balanceChanged', (accountId: string, balance: number) => {
  const change: BankingBalanceChange = { accountId, balance };

  for (const [source, accounts] of watchedAccounts) {
    if (accounts.has(accountId)) emitNet(BankingEvents.BALANCE_CHANGED, source, change);
  }
});

on('playerDropped', () => {
  watchedAccounts.delete(getSource());
});
