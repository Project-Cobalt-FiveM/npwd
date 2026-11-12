import React, { useEffect, useState } from 'react';
import { Avatar } from '@ui/cobalt';
import { usePhone } from '@os/phone/hooks/usePhone';
import { cn } from '@utils/css';

const MISSING_AVATAR_URL = 'https://cdn.fivemesh.io/npwd/default-avatar.png';

export const avatarSource = (url?: string | null): string | undefined =>
  url && url.trim() && url !== MISSING_AVATAR_URL ? url : undefined;

const useLoadableImage = (src?: string): string | undefined => {
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    const image = new Image();
    image.onerror = () => setFailed(src);
    image.src = src;
    return () => {
      image.onerror = null;
    };
  }, [src]);

  return src && failed !== src ? src : undefined;
};

export const profileHandle = (name: string): string => `@${name.replace(/\s+/g, '')}`;

interface PostAvatarProps {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}

export const PostAvatar: React.FC<PostAvatarProps> = ({ name, url, size = 40, className }) => {
  const { ResourceConfig } = usePhone();
  const src = useLoadableImage(
    ResourceConfig?.twitter.enableAvatars ? avatarSource(url) : undefined,
  );

  return (
    <Avatar
      name={name}
      src={src}
      size={size}
      className={cn('rounded font-bold text-white', className)}
    />
  );
};
