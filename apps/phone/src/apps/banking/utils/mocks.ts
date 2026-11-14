import {
  BankingAccount,
  BankingEntry,
  BankingMemberList,
  BankingRecipient,
  BankingStatementPage,
  BankingTransferReceipt,
} from '@typings/banking';

const now = Math.floor(Date.now() / 1000);
const hours = (count: number): number => now - count * 3600;

export const MockAccounts: BankingAccount[] = [
  {
    accountId: 'CB 7720 4821',
    type: 'personal',
    name: 'Personal',
    balance: 1240,
    primary: true,
    role: 'owner',
  },
  {
    accountId: 'CB 6104 7310',
    type: 'shared',
    name: 'Rent and bills',
    balance: 3860,
    primary: false,
    role: 'owner',
  },
  {
    accountId: 'CB 1180 5502',
    type: 'society',
    name: 'Bean Machine LLC',
    balance: 18420,
    primary: false,
    role: 'owner',
  },
  {
    accountId: 'CB 3391 0937',
    type: 'society',
    name: 'Los Santos Customs',
    balance: 24105,
    primary: false,
    role: 'member',
  },
  {
    accountId: 'CB 9050 2266',
    type: 'society',
    name: 'LSPD',
    balance: 61350,
    primary: false,
    role: 'viewer',
  },
];

const maya = { accountId: 'CB 4471 9046', type: 'personal' as const, name: 'Maya Delgado' };
const customs = { accountId: 'CB 3391 0937', type: 'society' as const, name: 'Los Santos Customs' };
const jamal = { accountId: 'CB 2209 3318', type: 'personal' as const, name: 'Jamal Reyes' };

export const MockEntries: BankingEntry[] = [
  {
    id: 41,
    accountId: 'CB 6104 7310',
    type: 'transfer_in',
    amount: 1200,
    note: 'Rent share',
    balanceAfter: 3860,
    receipt: 'FL-8W2D-4410',
    counterparty: maya,
    initiator: { citizenid: 'DLG48213', name: 'Maya Delgado' },
    createdAt: hours(1),
  },
  {
    id: 40,
    accountId: 'CB 6104 7310',
    type: 'transfer_out',
    amount: -640,
    note: 'Brake job, Sultan',
    balanceAfter: 2660,
    receipt: 'FL-4Q9M-1187',
    counterparty: customs,
    initiator: { citizenid: 'DLG48213', name: 'Maya Delgado' },
    createdAt: hours(2),
  },
  {
    id: 39,
    accountId: 'CB 6104 7310',
    type: 'transfer_out',
    amount: -180,
    note: 'Power bill',
    balanceAfter: 3300,
    receipt: 'FL-2L7P-0912',
    counterparty: jamal,
    initiator: { citizenid: 'MOR20417', name: 'Ava Morales' },
    createdAt: hours(26),
  },
  {
    id: 38,
    accountId: 'CB 6104 7310',
    type: 'deposit',
    amount: 300,
    note: 'Groceries',
    balanceAfter: 3480,
    receipt: 'FL-9T1R-5521',
    counterparty: null,
    initiator: { citizenid: 'DLG48213', name: 'Maya Delgado' },
    createdAt: hours(30),
  },
];

export const MockStatement: BankingStatementPage = { entries: MockEntries, nextCursor: null };

export const MockRecipients: BankingRecipient[] = [
  { accountId: jamal.accountId, type: 'personal', name: jamal.name, lastAt: hours(26) },
  { accountId: 'CB 1180 5502', type: 'society', name: 'Bean Machine LLC', lastAt: hours(110) },
  { accountId: customs.accountId, type: 'society', name: customs.name, lastAt: hours(130) },
];

export const MockRecipient: BankingRecipient = { ...maya, lastAt: null };

export const MockReceipt: BankingTransferReceipt = {
  balance: 1360,
  fee: 0,
  receipt: 'FL-7F3K-2291',
  transactionId: 40,
  toAccountId: maya.accountId,
};

export const MockMembers: BankingMemberList = {
  accountId: 'CB 6104 7310',
  type: 'shared',
  role: 'owner',
  canManage: true,
  maxMembers: 9,
  selfCitizenid: 'MOR20417',
  members: [
    { citizenid: 'MOR20417', name: 'Ava Morales', role: 'owner', rank: null },
    { citizenid: 'DLG48213', name: 'Maya Delgado', role: 'member', rank: null },
    { citizenid: 'BRK77302', name: 'Darnell Brooks', role: 'member', rank: null },
  ],
};
