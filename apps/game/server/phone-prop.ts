import { isPhoneProp, PHONE_PROP_EVENT, PHONE_PROP_STATE } from '@shared/phone-prop';

const setPhoneProp = (src: number, prop: unknown) => {
  Player(src).state.set(PHONE_PROP_STATE, isPhoneProp(prop) ? prop : null, true);
};

onNet(PHONE_PROP_EVENT, (prop: unknown) => setPhoneProp(global.source, prop));

on('playerDropped', () => setPhoneProp(global.source, null));
