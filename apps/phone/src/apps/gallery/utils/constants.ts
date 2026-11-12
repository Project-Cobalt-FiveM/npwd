import { GalleryPhoto } from '@typings/photo';

const hour = 3_600_000;
const day = 24 * hour;

const mockAges: readonly number[] = [
  0.2 * hour,
  1 * hour,
  3 * hour,
  5 * hour,
  1.2 * day,
  2 * day,
  3 * day,
  4 * day,
  12 * day,
  40 * day,
  41 * day,
];

export const MockPhotoData: GalleryPhoto[] = mockAges.map((age, index) => ({
  id: mockAges.length - index,
  image: `https://picsum.photos/seed/cobalt-${index + 1}/720/1280`,
  createdAt: Date.now() - age,
}));
