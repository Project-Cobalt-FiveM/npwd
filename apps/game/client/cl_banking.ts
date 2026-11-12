import { BankingBalanceChange, BankingCashPoint, BankingEvents } from '@typings/banking';
import { ServerPromiseResp } from '@typings/common';
import apps from '../utils/apps';
import { sendMessage } from '../utils/messages';
import { RegisterNuiCB, RegisterNuiProxy } from './cl_utils';

interface CashPointCoords extends BankingCashPoint {
  x: number;
  y: number;
  z: number;
}

RegisterNuiProxy(BankingEvents.FETCH_ACCOUNTS);
RegisterNuiProxy(BankingEvents.FETCH_STATEMENT);
RegisterNuiProxy(BankingEvents.FETCH_ENTRY);
RegisterNuiProxy(BankingEvents.FIND_RECIPIENT);
RegisterNuiProxy(BankingEvents.FETCH_RECENT_RECIPIENTS);
RegisterNuiProxy(BankingEvents.SEND_TRANSFER);
RegisterNuiProxy(BankingEvents.FETCH_MEMBERS);
RegisterNuiProxy(BankingEvents.INVITE_MEMBER);
RegisterNuiProxy(BankingEvents.REVOKE_MEMBER);

const isCashPoint = (value: unknown): value is CashPointCoords => {
  if (typeof value !== 'object' || value === null) return false;
  const point = value as Record<string, unknown>;
  return (
    typeof point.x === 'number' &&
    typeof point.y === 'number' &&
    typeof point.label === 'string' &&
    typeof point.atm === 'boolean'
  );
};

const nearestCashPoint = (): CashPointCoords | null => {
  if (GetResourceState('cobalt_banking') !== 'started') return null;

  try {
    const point: unknown = global.exports.cobalt_banking.FindNearestCashPoint();
    return isCashPoint(point) ? point : null;
  } catch {
    return null;
  }
};

RegisterNuiCB<void>(BankingEvents.MARK_CASH_POINT, (_data, cb) => {
  const point = nearestCashPoint();
  if (!point) return cb({ status: 'error', errorMsg: 'not_found' });

  SetNewWaypoint(point.x, point.y);
  const resp: ServerPromiseResp<BankingCashPoint> = {
    status: 'ok',
    data: { label: point.label, atm: point.atm },
  };
  cb(resp);
});

onNet(BankingEvents.BALANCE_CHANGED, (change: BankingBalanceChange) => {
  sendMessage(apps.BANKING, BankingEvents.BALANCE_CHANGED, change);
});
