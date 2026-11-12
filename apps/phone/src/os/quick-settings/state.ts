import { atom, AtomEffect, useRecoilState, useRecoilValue } from 'recoil';

export interface QuickSettings {
  doNotDisturb: boolean;
  airplaneMode: boolean;
  silent: boolean;
  flashlight: boolean;
  brightness: number;
}

export type QuickToggle = Exclude<keyof QuickSettings, 'brightness'>;

export const minBrightness = 0.4;

const storageKey = 'cobalt:quickSettings';

const defaultQuickSettings: QuickSettings = {
  doNotDisturb: false,
  airplaneMode: false,
  silent: false,
  flashlight: false,
  brightness: 1,
};

const flag = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

const parseStored = (raw: string | null): QuickSettings => {
  let data: unknown;

  try {
    data = JSON.parse(raw ?? '{}');
  } catch {
    return defaultQuickSettings;
  }

  if (typeof data !== 'object' || data === null) return defaultQuickSettings;

  const stored = data as Record<string, unknown>;
  const brightness = typeof stored.brightness === 'number' ? stored.brightness : 1;

  return {
    doNotDisturb: flag(stored.doNotDisturb, false),
    airplaneMode: flag(stored.airplaneMode, false),
    silent: flag(stored.silent, false),
    flashlight: false,
    brightness: Math.min(1, Math.max(minBrightness, brightness)),
  };
};

const persist: AtomEffect<QuickSettings> = ({ setSelf, onSet }) => {
  setSelf(parseStored(localStorage.getItem(storageKey)));
  onSet((value) => localStorage.setItem(storageKey, JSON.stringify(value)));
};

export const quickSettingsState = atom<QuickSettings>({
  key: 'cobalt:quickSettings',
  default: defaultQuickSettings,
  effects: [persist],
});

export const useQuickSettings = () => useRecoilState(quickSettingsState);
export const useQuickSettingsValue = () => useRecoilValue(quickSettingsState);
