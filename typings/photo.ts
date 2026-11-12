export interface GalleryPhoto {
  image: string;
  id: number;
  createdAt: number;
}

export enum PhotoResp {
  GENERIC = 'CAMERA.FAILED_TO_TAKE_PHOTO',
  INVALID_IMAGE_HOST = 'GENERIC_INVALID_IMAGE_HOST',
  BLANK_CAPTURE = 'COBALT.CAMERA.PHOTO_FAILED',
}

export enum PhotoEvents {
  TAKE_PHOTO = 'npwd:TakePhoto',
  CAMERA_EXITED = 'npwd:cameraExited',
  NPWD_PHOTO_MODE_STARTED = 'npwd:PhotoModeStarted',
  NPWD_PHOTO_MODE_ENDED = 'npwd:PhotoModeEnded',
  TAKE_PHOTO_SUCCESS = 'npwd:TakePhotoSuccess',
  SAVE_IMAGE = 'npwd:saveImage',
  UPLOAD_PHOTO = 'npwd:UploadPhoto',
  FETCH_PHOTOS = 'npwd:FetchPhotos',
  DELETE_PHOTO = 'npwd:deletePhoto',
  DELETE_MULTIPLE_PHOTOS = 'npwd:deleteMultiplePhotos',
}
