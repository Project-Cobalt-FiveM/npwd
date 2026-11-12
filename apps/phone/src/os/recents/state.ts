import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

export interface RecentApp {
  id: string;
  lastPath: string;
}

export const recentAppsState = atom<RecentApp[]>({
  key: 'cobalt:recentApps',
  default: [],
});

export const recentsOpenState = atom<boolean>({
  key: 'cobalt:recentsOpen',
  default: false,
});

export const useRecentAppsValue = () => useRecoilValue(recentAppsState);
export const useSetRecentApps = () => useSetRecoilState(recentAppsState);
export const useRecentsOpen = () => useRecoilState(recentsOpenState);
