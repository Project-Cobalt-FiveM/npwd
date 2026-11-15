export const PHONE_PROP_MODELS = ['prop_amb_phone', 'dolu_npwd_phone'] as const;

export type PhonePropModel = typeof PHONE_PROP_MODELS[number];

export interface PhoneProp {
  model: PhonePropModel;
  variation: number;
}

export const PHONE_PROP_EVENT = 'npwd:phoneProp';
export const PHONE_PROP_STATE = 'npwdPhoneProp';

const isPhonePropModel = (value: unknown): value is PhonePropModel =>
  PHONE_PROP_MODELS.some((model) => model === value);

export const isPhoneProp = (value: unknown): value is PhoneProp =>
  typeof value === 'object' &&
  value !== null &&
  'model' in value &&
  'variation' in value &&
  isPhonePropModel(value.model) &&
  Number.isInteger(value.variation);
