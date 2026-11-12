import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ServerPromiseResp } from '@typings/common';
import { GalleryPhoto, PhotoEvents } from '@typings/photo';
import fetchNui from '@utils/fetchNui';
import LogDebugEvent from '../../../os/debug/LogDebugEvents';
import { buildRespObj } from '../../../utils/misc';
import { MockPhotoData } from '../utils/constants';

interface PhotoFetchResult {
  photos: GalleryPhoto[];
  failed: boolean;
}

const toCreatedAt = (value: unknown): number => {
  const time = Number(value);
  return Number.isFinite(time) && time > 0 ? time : Date.now();
};

const photoFetch = selector<PhotoFetchResult>({
  key: 'galleryPhotoFetch',
  get: async () => {
    try {
      const resp = await fetchNui<ServerPromiseResp<GalleryPhoto[]>>(
        PhotoEvents.FETCH_PHOTOS,
        undefined,
        buildRespObj(MockPhotoData),
      );
      const photos = (resp?.data ?? []).map((photo) => ({
        ...photo,
        createdAt: toCreatedAt(photo.createdAt),
      }));
      LogDebugEvent({ action: 'PhotosFetched', data: photos });
      return { photos, failed: resp?.status !== 'ok' };
    } catch (e) {
      console.error(`Failed to fetch photos: ${e instanceof Error ? e.message : String(e)}`);
      return { photos: [], failed: true };
    }
  },
});

export const photoState = {
  photos: atom<GalleryPhoto[]>({
    key: 'galleryPhotos',
    default: selector({
      key: 'defaultGalleryPhotos',
      get: ({ get }) => get(photoFetch).photos,
    }),
  }),
};

export const useSetPhotos = () => useSetRecoilState(photoState.photos);
export const usePhotos = () => useRecoilState(photoState.photos);
export const usePhotosValue = () => useRecoilValue(photoState.photos);
export const usePhotoFetchFailed = () => useRecoilValue(photoFetch).failed;
