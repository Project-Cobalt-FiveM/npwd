import { isPhoneProp, PhoneProp, PHONE_PROP_EVENT, PHONE_PROP_STATE } from '@shared/phone-prop';
import { Delay } from '../utils/fivem';

const OTHERS_REFRESH_MS = 500;
const HAND_BONE = 28422;

interface HeldPhone extends PhoneProp {
  ped: number;
  entity: number;
}

const others = new Map<number, HeldPhone>();
const loading = new Set<number>();

const loadModel = async (model: string) => {
  RequestModel(model);
  while (!HasModelLoaded(model)) await Delay(1);
};

export const spawnPhoneProp = async (ped: number, { model, variation }: PhoneProp) => {
  await loadModel(model);

  const [x, y, z] = GetEntityCoords(ped, true);
  const entity = CreateObject(GetHashKey(model), x, y, z + 0.2, false, false, false);

  SetModelAsNoLongerNeeded(model);
  SetEntityCollision(entity, false, false);
  AttachEntityToEntity(
    entity,
    ped,
    GetPedBoneIndex(ped, HAND_BONE),
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    true,
    true,
    false,
    false,
    2,
    true,
  );
  SetObjectTextureVariation(entity, variation);

  return entity;
};

export const sharePhoneProp = (prop: PhoneProp | null) => emitNet(PHONE_PROP_EVENT, prop);

const deleteEntity = (entity: number) => {
  if (DoesEntityExist(entity)) DeleteEntity(entity);
};

const forgetOther = (serverId: number) => {
  const held = others.get(serverId);
  if (held) deleteEntity(held.entity);
  others.delete(serverId);
};

const isCurrent = (held: HeldPhone | undefined, ped: number, prop: PhoneProp) =>
  held?.ped === ped &&
  held.model === prop.model &&
  held.variation === prop.variation &&
  DoesEntityExist(held.entity);

const refreshOther = async (serverId: number, ped: number, prop: PhoneProp) => {
  if (isCurrent(others.get(serverId), ped, prop) || loading.has(serverId)) return;

  loading.add(serverId);
  forgetOther(serverId);
  const entity = await spawnPhoneProp(ped, prop);
  loading.delete(serverId);
  others.set(serverId, { ...prop, ped, entity });
};

const refreshOthers = () => {
  const seen = new Set<number>();
  const self = PlayerId();

  for (const playerId of GetActivePlayers() as number[]) {
    if (playerId === self) continue;

    const serverId = GetPlayerServerId(playerId);
    const ped = GetPlayerPed(playerId);
    const prop: unknown = Player(serverId).state[PHONE_PROP_STATE];

    if (ped === 0 || !isPhoneProp(prop)) continue;

    seen.add(serverId);
    refreshOther(serverId, ped, prop);
  }

  for (const serverId of others.keys()) {
    if (!seen.has(serverId) && !loading.has(serverId)) forgetOther(serverId);
  }
};

setInterval(refreshOthers, OTHERS_REFRESH_MS);

on('onResourceStop', (resource: string) => {
  if (resource !== GetCurrentResourceName()) return;

  for (const serverId of others.keys()) forgetOther(serverId);
});
