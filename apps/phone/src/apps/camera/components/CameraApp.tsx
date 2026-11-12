import React, { useEffect, useRef } from 'react';
import qs from 'qs';
import { Redirect, useHistory } from 'react-router-dom';
import { Camera } from '@phosphor-icons/react';
import { ServerPromiseResp } from '@typings/common';
import { GalleryPhoto, PhotoEvents, PhotoResp } from '@typings/photo';
import fetchNui from '@utils/fetchNui';
import { buildRespObj } from '@utils/misc';
import { useNuiEvent } from '@common/hooks/useNuiEvent';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { usePhotoActions } from '@apps/gallery/hooks/usePhotoActions';
import { useText } from '@apps/gallery/hooks/useText';

const mockCapture = (): ServerPromiseResp<GalleryPhoto> =>
  buildRespObj(
    {
      id: Date.now(),
      image: `https://picsum.photos/seed/cobalt-${Date.now()}/720/1280`,
      createdAt: Date.now(),
    },
    'ok',
  );

const CameraCapture: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const { addAlert } = useSnackbar();
  const { saveLocalImage } = usePhotoActions();
  const started = useRef(false);

  const leave = () => {
    if (history.length > 1) history.goBack();
    else history.replace('/');
  };

  useNuiEvent('CAMERA', PhotoEvents.CAMERA_EXITED, leave);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    fetchNui<ServerPromiseResp<GalleryPhoto>>(
      PhotoEvents.TAKE_PHOTO,
      undefined,
      mockCapture(),
    ).then((resp) => {
      if (resp.status !== 'ok') {
        addAlert({ message: t(resp.errorMsg ?? PhotoResp.GENERIC), type: 'error' });
      } else {
        saveLocalImage(resp.data);
        addAlert({ message: t('COBALT.CAMERA.SAVED'), type: 'success' });
      }
      leave();
    });
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-cb-background font-sans text-cb-muted-foreground">
      <Camera size={28} weight="fill" />
      <p className="text-sm">{t('COBALT.CAMERA.OPENING')}</p>
    </div>
  );
};

const CameraApp: React.FC = () => {
  const query = useQueryParams();

  if (query.referal) {
    return <Redirect to={`/gallery?${qs.stringify({ referal: query.referal })}`} />;
  }

  return <CameraCapture />;
};

export default CameraApp;
