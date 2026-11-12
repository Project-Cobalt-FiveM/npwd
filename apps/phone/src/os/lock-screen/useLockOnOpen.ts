import { useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { phoneState } from '@os/phone/hooks/state';
import { useSettingsValue } from '../../apps/settings/hooks/useSettings';
import { recentsOpenState } from '@os/recents/state';
import { useSetLockScreen } from './state';

export const useLockOnOpen = () => {
  const visible = useRecoilValue(phoneState.visibility);
  const { lockScreen } = useSettingsValue();
  const setLocked = useSetLockScreen();
  const setRecentsOpen = useSetRecoilState(recentsOpenState);
  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible && !wasVisible.current && lockScreen !== false) {
      setLocked(true);
      setRecentsOpen(false);
    }
    wasVisible.current = visible;
  }, [visible, lockScreen, setLocked, setRecentsOpen]);
};
