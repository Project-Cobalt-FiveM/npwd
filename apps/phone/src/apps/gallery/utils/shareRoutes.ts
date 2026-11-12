import qs from 'qs';

export const messagesComposeRoute = (image: string, to?: string): string =>
  `/messages/new?${qs.stringify(to ? { to, image } : { image })}`;

export const lifeInvaderComposeRoute = (image: string): string =>
  `/twitter?${qs.stringify({ compose: 1, image })}`;

export const marketplaceComposeRoute = (image: string): string =>
  `/marketplace/new?${qs.stringify({ image })}`;
