const missingAvatar = 'https://cdn.fivemesh.io/npwd/default-avatar.png';

export const avatarSource = (url?: string | null): string | undefined =>
  url && url.trim() !== '' && url !== missingAvatar ? url : undefined;
