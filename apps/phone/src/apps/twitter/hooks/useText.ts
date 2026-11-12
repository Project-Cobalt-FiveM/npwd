import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TOptions } from 'i18next';

export type Translate = (key: string, options?: TOptions) => string;

export const useText = (): Translate => {
  const [t] = useTranslation();
  return useCallback<Translate>((key, options) => t(key, options), [t]);
};
