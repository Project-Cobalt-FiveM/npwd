import { GalleryPhoto } from '@typings/photo';
import { DbInterface } from '@npwd/database';

const SELECT_PHOTOS =
  'SELECT id, image, UNIX_TIMESTAMP(created_at) * 1000 AS createdAt FROM npwd_phone_gallery WHERE identifier = ? ORDER BY id DESC';

export class _PhotoDB {
  async uploadPhoto(identifier: string, image: string): Promise<GalleryPhoto> {
    const query = 'INSERT INTO npwd_phone_gallery (identifier, image) VALUES (?, ?)';
    const [results] = (await DbInterface._rawExec(query, [identifier, image])) as any;
    return { id: results.insertId, image, createdAt: Date.now() };
  }

  async getPhotosByIdentifier(identifier: string): Promise<GalleryPhoto[]> {
    const [results] = await DbInterface._rawExec(SELECT_PHOTOS, [identifier]);
    return <GalleryPhoto[]>results;
  }

  async deletePhoto(photo: GalleryPhoto, identifier: string) {
    const query = 'DELETE FROM npwd_phone_gallery WHERE image = ? AND identifier = ?';
    await DbInterface._rawExec(query, [photo.image, identifier]);
  }

  async deletePhotoById(photo: number, identifier: string) {
    const query = 'DELETE FROM npwd_phone_gallery WHERE id = ? AND identifier = ?';
    await DbInterface._rawExec(query, [photo, identifier]);
  }
}

export const PhotoDB = new _PhotoDB();
