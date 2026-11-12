import { CallEvents, ActiveCall } from '@typings/call';
import { useNuiEvent } from 'fivem-nui-react-lib';
import { useHistory } from 'react-router-dom';
import { useCallNotification } from '@os/new-notifications/useCallNotification';
import { useSetRecoilState } from 'recoil';
import { callerState } from './state';
import { useCall } from './useCall';

const callPath = '/call';

export const useCallService = () => {
  const history = useHistory();
  const { endCall } = useCall();
  const setCall = useSetRecoilState(callerState.currentCall);
  const setCallModal = useSetRecoilState(callerState.callModal);

  const { enqueueCallNotification, removeNotification } = useCallNotification();

  useNuiEvent<ActiveCall | null>('CALL', CallEvents.SET_CALL_INFO, (callData) => {
    if (!callData) {
      return removeNotification();
    }

    setCall(callData);
    enqueueCallNotification(callData);

    if (callData.isTransmitter && !callData.is_accepted && history.location.pathname !== callPath) {
      history.push(callPath);
    }
  });

  useNuiEvent<boolean>('CALL', CallEvents.SET_CALL_MODAL, (show) => {
    setCallModal(show);
    if (!show && history.location.pathname === callPath) history.goBack();
  });

  useNuiEvent('CALL', CallEvents.END_CALL, endCall);
};
