export type BankingAccountType = 'personal' | 'shared' | 'society';

export type BankingRole = 'owner' | 'admin' | 'member' | 'viewer';

export type BankingFailure =
  | 'invalid_amount'
  | 'not_found'
  | 'no_permission'
  | 'same_account'
  | 'insufficient_funds'
  | 'account_frozen'
  | 'recipient_frozen'
  | 'already_member'
  | 'member_limit'
  | 'unavailable';

export type BankingDirection = 'all' | 'in' | 'out';

export interface BankingAccount {
  accountId: string;
  type: BankingAccountType;
  name: string;
  balance: number;
  frozen: boolean;
  primary: boolean;
  role: BankingRole;
}

export interface BankingOverview {
  holder: string | null;
  accounts: BankingAccount[];
}

export interface BankingParty {
  accountId: string;
  type: BankingAccountType | null;
  name: string | null;
}

export interface BankingInitiator {
  citizenid: string;
  name: string;
}

export interface BankingEntry {
  id: number;
  accountId: string;
  type: string;
  amount: number;
  note: string | null;
  balanceAfter: number | null;
  receipt: string | null;
  counterparty: BankingParty | null;
  initiator: BankingInitiator | null;
  createdAt: number;
}

export interface BankingStatementQuery {
  accountId: string;
  direction: BankingDirection;
  before?: number;
}

export interface BankingStatementPage {
  entries: BankingEntry[];
  nextCursor: number | null;
}

export interface BankingRecipient {
  accountId: string;
  type: BankingAccountType;
  name: string;
  lastAt: number | null;
}

export interface BankingTransferRequest {
  from: string;
  to: string;
  amount: number;
  note?: string;
}

export interface BankingTransferReceipt {
  balance: number;
  fee: number;
  receipt: string;
  transactionId: number;
  toAccountId: string;
}

export interface BankingMember {
  citizenid: string;
  name: string;
  role: BankingRole;
  rank: string | null;
}

export interface BankingMemberList {
  accountId: string;
  type: BankingAccountType;
  role: BankingRole;
  canManage: boolean;
  maxMembers: number;
  members: BankingMember[];
  selfCitizenid: string;
}

export interface BankingMemberChange {
  accountId: string;
  citizenid: string;
}

export interface BankingBalanceChange {
  accountId: string;
  balance: number;
}

export interface BankingCashPoint {
  label: string;
  atm: boolean;
}

export enum BankingEvents {
  FETCH_ACCOUNTS = 'npwd:banking:fetchAccounts',
  FETCH_STATEMENT = 'npwd:banking:fetchStatement',
  FETCH_ENTRY = 'npwd:banking:fetchEntry',
  FIND_RECIPIENT = 'npwd:banking:findRecipient',
  FETCH_RECENT_RECIPIENTS = 'npwd:banking:fetchRecentRecipients',
  SEND_TRANSFER = 'npwd:banking:sendTransfer',
  FETCH_MEMBERS = 'npwd:banking:fetchMembers',
  INVITE_MEMBER = 'npwd:banking:inviteMember',
  REVOKE_MEMBER = 'npwd:banking:revokeMember',
  MARK_CASH_POINT = 'npwd:banking:markCashPoint',
  BALANCE_CHANGED = 'npwd:banking:balanceChanged',
}
