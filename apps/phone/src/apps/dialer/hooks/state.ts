import { atom, selector, useSetRecoilState } from 'recoil';
import { CallEvents, CallHistoryItem } from '@typings/call';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import LogDebugEvent from '../../../os/debug/LogDebugEvents';
import { isEnvBrowser } from '../../../utils/misc';
import { MockHistoryData } from '../utils/constants';

export const dialState = {
  history: atom<CallHistoryItem[]>({
    key: 'dialHistory',
    default: selector({
      key: 'dialHistoryDefault',
      get: async () => {
        try {
          const resp = await fetchNui<ServerPromiseResp<CallHistoryItem[]>>(CallEvents.FETCH_CALLS);
          const history = resp?.data ?? [];
          LogDebugEvent({ action: CallEvents.FETCH_CALLS, data: history });
          return history;
        } catch (e) {
          if (isEnvBrowser()) {
            return MockHistoryData;
          }
          console.error(e);
          return [];
        }
      },
    }),
  }),
};

export const useSetHistory = () => useSetRecoilState(dialState.history);
