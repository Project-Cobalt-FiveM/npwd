import { KvpItems } from '@typings/settings';
import { PhonePropModel } from '@shared/phone-prop';
import KvpService from './settings/client-kvp.service';
import { sharePhoneProp, spawnPhoneProp } from './phone-prop';

global.phoneProp = 0;
let propCreated = false;
let propRequest = 0;

const deleteOwnProp = () => {
  if (global.phoneProp != 0) DeleteEntity(global.phoneProp);
  global.phoneProp = 0;
};

export const newPhoneProp = async () => {
  const hasNPWDProps = GetConvarInt('NPWD_PROPS', 0);
  const model: PhonePropModel = hasNPWDProps ? 'dolu_npwd_phone' : 'prop_amb_phone';
  const variation = (hasNPWDProps && KvpService.getKvpInt(KvpItems.NPWD_FRAME)) || 7;
  const request = ++propRequest;

  deleteOwnProp();
  propCreated = true;

  const entity = await spawnPhoneProp(PlayerPedId(), { model, variation });

  if (request !== propRequest) {
    DeleteEntity(entity);
    return;
  }

  global.phoneProp = entity;
  sharePhoneProp({ model, variation });
};

export function removePhoneProp() {
  propRequest++;
  deleteOwnProp();
  if (propCreated) sharePhoneProp(null);
  propCreated = false;
}
