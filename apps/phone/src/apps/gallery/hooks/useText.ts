import { useCallback } from 'react';
import { TOptions } from 'i18next';
import { useTranslation } from 'react-i18next';

export const useText = () => {
  const [t] = useTranslation();
  return useCallback((key: string, options?: TOptions): string => t(key, options), [t]);
};
