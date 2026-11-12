import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionPeriod } from '../utils/sections';

export const usePeriodLabel = () => {
  const [t, i18n] = useTranslation();

  return useCallback(
    (period: SectionPeriod): string => {
      switch (period.kind) {
        case 'today':
          return t('COBALT.GALLERY.TODAY');
        case 'yesterday':
          return t('COBALT.GALLERY.YESTERDAY');
        case 'week':
          return t('COBALT.GALLERY.THIS_WEEK');
        case 'month':
          return new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(
            new Date(period.year, period.month, 1),
          );
        default: {
          const exhaustive: never = period;
          return exhaustive;
        }
      }
    },
    [t, i18n.language],
  );
};

const dayMs = 86_400_000;

export const usePhotoTimestamp = () => {
  const [t, i18n] = useTranslation();

  return useCallback(
    (createdAt: number): string => {
      const time = new Intl.DateTimeFormat(i18n.language, {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (createdAt >= today.getTime()) return `${t('COBALT.GALLERY.TODAY')}, ${time}`;
      if (createdAt >= today.getTime() - dayMs) return `${t('COBALT.GALLERY.YESTERDAY')}, ${time}`;
      const date = new Intl.DateTimeFormat(i18n.language, {
        day: 'numeric',
        month: 'short',
      }).format(createdAt);
      return `${date}, ${time}`;
    },
    [t, i18n.language],
  );
};
