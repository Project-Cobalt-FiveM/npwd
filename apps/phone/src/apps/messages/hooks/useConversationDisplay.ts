import { useCallback } from 'react';
import { MessageConversation } from '@typings/messages';
import { Contact } from '@typings/contact';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useContactActions } from '../../contacts/hooks/useContactActions';

const missingAvatar = 'https://cdn.fivemesh.io/npwd/default-avatar.png';

export interface Member {
  number: string;
  name: string;
  avatar?: string;
}

export interface ConversationDisplay {
  name: string;
  members: Member[];
  contact: Contact | null;
}

export const usableAvatar = (src?: string | null): string | undefined =>
  src && src !== missingAvatar ? src : undefined;

export const conversationNumbers = (conversationList: string): string[] =>
  conversationList.split('+').filter(Boolean);

export const findDirectConversation = (
  conversations: MessageConversation[],
  myNumber: string,
  number: string,
): MessageConversation | undefined =>
  conversations.find((conversation) => {
    if (conversation.isGroupChat) return false;
    const numbers = conversationNumbers(conversation.conversationList);
    const self = conversation.participant ?? myNumber;
    return (
      numbers.includes(number) && numbers.every((n) => n === number || n === myNumber || n === self)
    );
  });

export const useMember = () => {
  const { getContactByNumber } = useContactActions();

  return useCallback(
    (number: string): Member => {
      const contact = getContactByNumber(number);
      return { number, name: contact?.display || number, avatar: usableAvatar(contact?.avatar) };
    },
    [getContactByNumber],
  );
};

export const useConversationDisplay = () => {
  const myNumber = useMyPhoneNumber();
  const { getContactByNumber } = useContactActions();
  const toMember = useMember();

  return useCallback(
    (conversation: MessageConversation): ConversationDisplay => {
      const self = conversation.participant ?? myNumber;
      const others = conversationNumbers(conversation.conversationList).filter(
        (number) => number !== self && number !== myNumber,
      );
      const members = others.map(toMember);
      const contact = !conversation.isGroupChat && others[0] ? getContactByNumber(others[0]) : null;
      const name = conversation.isGroupChat
        ? conversation.label || members.map((member) => member.name).join(', ')
        : members[0]?.name ?? self;

      return { name, members, contact };
    },
    [myNumber, getContactByNumber, toMember],
  );
};
