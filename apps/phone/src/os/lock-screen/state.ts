import { atom, useRecoilValue, useSetRecoilState } from 'recoil';

export const lockScreenState = atom<boolean>({
  key: 'cobalt:locked',
  default: false,
});

export const useLockScreenValue = () => useRecoilValue(lockScreenState);
export const useSetLockScreen = () => useSetRecoilState(lockScreenState);
