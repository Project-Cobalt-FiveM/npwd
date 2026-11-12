import { GalleryPhoto } from '@typings/photo';

export type SectionPeriod =
  | { kind: 'today' }
  | { kind: 'yesterday' }
  | { kind: 'week' }
  | { kind: 'month'; year: number; month: number };

export interface PhotoSection {
  key: string;
  period: SectionPeriod;
  photos: GalleryPhoto[];
}

const dayMs = 86_400_000;

const startOfDay = (time: number): number => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const periodOf = (createdAt: number, today: number): SectionPeriod => {
  const day = startOfDay(createdAt);
  if (day >= today) return { kind: 'today' };
  if (day >= today - dayMs) return { kind: 'yesterday' };
  if (day >= today - 6 * dayMs) return { kind: 'week' };
  const date = new Date(createdAt);
  return { kind: 'month', year: date.getFullYear(), month: date.getMonth() };
};

const periodKey = (period: SectionPeriod): string =>
  period.kind === 'month' ? `${period.year}-${period.month}` : period.kind;

export const groupPhotosByPeriod = (photos: GalleryPhoto[], now: number): PhotoSection[] => {
  const today = startOfDay(now);
  const sections = new Map<string, PhotoSection>();

  for (const photo of photos) {
    const period = periodOf(photo.createdAt, today);
    const key = periodKey(period);
    const section = sections.get(key);
    if (section) section.photos.push(photo);
    else sections.set(key, { key, period, photos: [photo] });
  }

  return Array.from(sections.values());
};
