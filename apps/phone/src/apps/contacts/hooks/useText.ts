import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { StringMap } from 'i18next';

export type Text = (key: string, values?: StringMap) => string;

export const useText = (): Text => {
  const { t } = useTranslation();
  return useCallback<Text>((key, values) => t<string>(key, values), [t]);
};
