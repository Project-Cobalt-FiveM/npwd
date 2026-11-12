import { Message, MessageConversation } from '@typings/messages';
import { ServerPromiseResp } from '@typings/common';

const me = '111-1134';
const now = Math.floor(Date.now() / 1000);
const minutesAgo = (minutes: number): number => now - minutes * 60;

export const MockMessageConversations: MessageConversation[] = [
  {
    id: 1,
    conversationList: `555-0142+${me}`,
    participant: me,
    unreadCount: 2,
    label: '',
    updatedAt: minutesAgo(4),
    isGroupChat: false,
  },
  {
    id: 2,
    conversationList: `555-0123+555-0131+555-0176+${me}`,
    participant: me,
    unreadCount: 5,
    label: 'Vespucci crew',
    updatedAt: minutesAgo(33),
    isGroupChat: true,
  },
  {
    id: 3,
    conversationList: `555-0198+${me}`,
    participant: me,
    unreadCount: 0,
    label: '',
    updatedAt: minutesAgo(95),
    isGroupChat: false,
  },
  {
    id: 4,
    conversationList: `555-0176+${me}`,
    participant: me,
    unreadCount: 0,
    label: '',
    updatedAt: minutesAgo(60 * 26),
    isGroupChat: false,
  },
  {
    id: 5,
    conversationList: `555-0147+${me}`,
    participant: me,
    unreadCount: 0,
    label: '',
    updatedAt: minutesAgo(60 * 24 * 3),
    isGroupChat: false,
  },
];

const MockConversationMessages: Message[] = [
  {
    id: 1,
    author: '555-0142',
    message: 'You still got the keys to the Sultan?',
    createdAt: minutesAgo(60 * 25),
  },
  {
    id: 2,
    author: me,
    message: "Yeah, it's parked at the Vespucci lot",
    createdAt: minutesAgo(60 * 25 - 2),
  },
  {
    id: 3,
    author: '555-0131',
    message: 'https://i.imgur.com/7juREyw.png',
    createdAt: minutesAgo(60 * 25 - 5),
  },
  {
    id: 4,
    author: '555-0142',
    message: 'Location shared',
    createdAt: minutesAgo(9),
    is_embed: true,
    embed: JSON.stringify({
      type: 'location',
      coords: [215.8, -810.1, 30.7],
      phoneNumber: '555-0142',
    }),
  },
  {
    id: 5,
    author: '555-0142',
    message: 'Pulling up at Legion Square in 5',
    createdAt: minutesAgo(8),
  },
  { id: 6, author: '555-0123', message: "I'm in. Bringing the speaker", createdAt: minutesAgo(7) },
  { id: 7, author: '555-0123', message: 'And snacks', createdAt: minutesAgo(7) },
  {
    id: 8,
    author: me,
    message: 'On my way, grab a spot by the fountain',
    createdAt: minutesAgo(5),
  },
  {
    id: 9,
    author: '555-0176',
    message: 'Contact shared',
    createdAt: minutesAgo(4),
    is_embed: true,
    embed: JSON.stringify({ type: 'contact', display: 'Downtown Cab Co.', number: '555-0110' }),
  },
];

export const MockConversationServerResp: ServerPromiseResp<Message[]> = {
  data: MockConversationMessages,
  status: 'ok',
};
