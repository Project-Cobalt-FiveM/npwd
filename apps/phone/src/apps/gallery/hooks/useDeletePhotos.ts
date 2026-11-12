import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ServerPromiseResp } from '@typings/common';
import { GalleryPhoto, PhotoEvents } from '@typings/photo';
import fetchNui from '@utils/fetchNui';
import { buildRespObj } from '@utils/misc';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { usePhotoActions } from './usePhotoActions';

export const useDeletePhotos = () => {
  const [t] = useTranslation();
  const { addAlert } = useSnackbar();
  const { deletePhoto, deletePhotos } = usePhotoActions();

  return useCallback(
    async (photos: GalleryPhoto[]): Promise<boolean> => {
      const [single] = photos;
      const resp =
        photos.length === 1
          ? await fetchNui<ServerPromiseResp<void>>(
              PhotoEvents.DELETE_PHOTO,
              { image: single.image },
              buildRespObj(null, 'ok'),
            )
          : await fetchNui<ServerPromiseResp<void>>(
              PhotoEvents.DELETE_MULTIPLE_PHOTOS,
              photos.map((photo) => photo.id),
              buildRespObj(null, 'ok'),
            );

      if (resp.status !== 'ok') {
        addAlert({ message: t('COBALT.GALLERY.DELETE_FAILED'), type: 'error' });
        return false;
      }

      if (photos.length === 1) deletePhoto(single.image);
      else deletePhotos(photos.map((photo) => photo.id));
      addAlert({
        message: t('COBALT.GALLERY.DELETED', { count: photos.length }),
        type: 'success',
      });
      return true;
    },
    [addAlert, deletePhoto, deletePhotos, t],
  );
};
