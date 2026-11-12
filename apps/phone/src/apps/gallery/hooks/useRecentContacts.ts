import { useMemo } from 'react';
import { useMessageConversationsValue } from '@apps/messages/hooks/state';
import { useContactsValue } from '@apps/contacts/hooks/state';

export interface RecentContact {
  number: string;
  name: string;
  avatar?: string;
}

const recentLimit = 5;

export const useRecentContacts = (): RecentContact[] => {
  const conversations = useMessageConversationsValue();
  const contacts = useContactsValue();

  return useMemo(
    () =>
      conversations
        .filter((conversation) => !conversation.isGroupChat)
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
        .slice(0, recentLimit)
        .map((conversation): RecentContact | null => {
          const number = conversation.conversationList
            .split('+')
            .find((participant) => participant !== conversation.participant);
          if (!number) return null;
          const contact = contacts.find((entry) => entry.number === number);
          return { number, name: contact?.display || number, avatar: contact?.avatar };
        })
        .filter((contact): contact is RecentContact => contact !== null),
    [conversations, contacts],
  );
};
