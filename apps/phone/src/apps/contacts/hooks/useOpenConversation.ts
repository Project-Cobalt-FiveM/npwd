import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import useMessages from '@apps/messages/hooks/useMessages';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useContactActions } from './useContactActions';

export const useOpenConversation = (): ((phoneNumber: string) => void) => {
  const history = useHistory();
  const myPhoneNumber = useMyPhoneNumber();
  const { goToConversation } = useMessages();
  const { findExistingConversation } = useContactActions();

  return useCallback(
    (phoneNumber: string) => {
      const conversation = findExistingConversation(myPhoneNumber, phoneNumber);
      if (conversation) {
        goToConversation(conversation);
        return;
      }
      history.push(`/messages/new?to=${encodeURIComponent(phoneNumber)}`);
    },
    [findExistingConversation, goToConversation, history, myPhoneNumber],
  );
};
