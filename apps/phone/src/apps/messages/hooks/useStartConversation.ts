import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import qs from 'qs';
import { MessageConversation } from '@typings/messages';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useMessageConversationsValue } from './state';
import { useMessageAPI } from './useMessageAPI';
import { findDirectConversation } from './useConversationDisplay';
import { useText } from './useText';

export interface ThreadQuery {
  image?: string;
}

export const threadPath = (conversationId: number, query: ThreadQuery = {}): string => {
  const search = qs.stringify(query);
  return `/messages/conversations/${conversationId}${search ? `?${search}` : ''}`;
};

export const useStartConversation = () => {
  const history = useHistory();
  const t = useText();
  const { addAlert } = useSnackbar();
  const myNumber = useMyPhoneNumber();
  const conversations = useMessageConversationsValue();
  const { addConversation } = useMessageAPI();

  const openDirect = useCallback(
    (number: string, query: ThreadQuery = {}) => {
      if (number === myNumber) {
        addAlert({ message: t('COBALT.MESSAGES.NOT_YOURSELF'), type: 'error' });
        return;
      }

      const open = (conversation: MessageConversation) =>
        history.replace(threadPath(conversation.id, query));
      const existing = findDirectConversation(conversations, myNumber, number);
      if (existing) return open(existing);

      addConversation(
        { conversationLabel: '', participants: [myNumber, number], isGroupChat: false },
        open,
      );
    },
    [addAlert, addConversation, conversations, history, myNumber, t],
  );

  const createGroup = useCallback(
    (numbers: string[], label: string, query: ThreadQuery = {}) =>
      addConversation(
        { conversationLabel: label, participants: [myNumber, ...numbers], isGroupChat: true },
        (conversation) => history.replace(threadPath(conversation.id, query)),
      ),
    [addConversation, history, myNumber],
  );

  return { openDirect, createGroup };
};
