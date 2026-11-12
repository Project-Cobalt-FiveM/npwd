import { hidePhone } from './cl_main';

interface ReviveState {
  state?: string;
}

interface PlayerStateBag {
  revive?: ReviveState;
  isDead?: boolean;
}

declare const LocalPlayer: { state: PlayerStateBag };
declare function AddStateBagChangeHandler(
  key: string,
  bagFilter: string | null,
  handler: (bagName: string, key: string, value: unknown) => void,
): number;

const AMBULANCE_RESOURCE = 'cobalt_ambulancejob';
const BLOCKING_REVIVE_STATES: ReadonlySet<string> = new Set(['down', 'dead']);
const PAUSE_CHECK_MS = 400;

let pauseWatch: ReturnType<typeof setInterval> | null = null;

const isIncapacitated = (bag: PlayerStateBag): boolean => {
  if (GetResourceState(AMBULANCE_RESOURCE) !== 'started') return false;
  const reviveState = bag.revive?.state;
  return reviveState ? BLOCKING_REVIVE_STATES.has(reviveState) : bag.isDead === true;
};

const isPhoneBlocked = (): boolean => IsPauseMenuActive() || isIncapacitated(LocalPlayer.state);

const stopPauseWatch = (): void => {
  if (pauseWatch) clearInterval(pauseWatch);
  pauseWatch = null;
};

const startPauseWatch = (): void => {
  if (pauseWatch) return;
  pauseWatch = setInterval(() => {
    if (!global.isPhoneOpen) return stopPauseWatch();
    if (IsPauseMenuActive()) void hidePhone();
  }, PAUSE_CHECK_MS);
};

export const canOpenPhone = (): boolean => {
  if (isPhoneBlocked()) return false;
  startPauseWatch();
  return true;
};

const closeIfIncapacitated = (bag: PlayerStateBag): void => {
  if (global.isPhoneOpen && isIncapacitated(bag)) void hidePhone();
};

const localBag = `player:${GetPlayerServerId(PlayerId())}`;

AddStateBagChangeHandler('revive', localBag, (_bagName, _key, value) =>
  closeIfIncapacitated({
    revive: value as ReviveState | undefined,
    isDead: LocalPlayer.state.isDead,
  }),
);
AddStateBagChangeHandler('isDead', localBag, (_bagName, _key, value) =>
  closeIfIncapacitated({ revive: LocalPlayer.state.revive, isDead: value === true }),
);
