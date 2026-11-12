import { Message } from '@typings/messages';

export type MessageEmbed =
  | { type: 'location'; coords: number[] }
  | { type: 'contact'; display: string; number: string; avatar?: string }
  | { type: 'note'; title: string; content: string }
  | { type: 'audio'; url: string };

export type MessageBody =
  | { kind: 'text'; text: string }
  | { kind: 'image'; url: string }
  | { kind: 'embed'; embed: MessageEmbed; text: string };

const imagePattern = /^https?:\/\/\S+\.(?:jpg|png|jpeg|gif|webp)(?:\?\S*)?$/i;
const imageHostPattern = /^https?:\/\/cdn\.fivemesh\.io\/\S+$/i;

export const isImageUrl = (value: string): boolean =>
  imagePattern.test(value.trim()) || imageHostPattern.test(value.trim());

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toEmbed = (value: unknown): MessageEmbed | null => {
  if (!isRecord(value)) return null;

  switch (value.type) {
    case 'location':
      return Array.isArray(value.coords) && value.coords.every((n) => typeof n === 'number')
        ? { type: 'location', coords: value.coords }
        : null;
    case 'contact':
      return {
        type: 'contact',
        display: asString(value.display),
        number: asString(value.number),
        avatar: asString(value.avatar) || undefined,
      };
    case 'note':
      return { type: 'note', title: asString(value.title), content: asString(value.content) };
    case 'audio':
      return typeof value.url === 'string' ? { type: 'audio', url: value.url } : null;
    default:
      return null;
  }
};

const parseEmbed = (raw: unknown): MessageEmbed | null => {
  if (typeof raw !== 'string') return toEmbed(raw);
  try {
    return toEmbed(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const parseMessageBody = (message: Message): MessageBody => {
  const text = message.message ?? '';
  if (message.is_embed) {
    const embed = parseEmbed(message.embed);
    if (embed) return { kind: 'embed', embed, text };
  }
  if (isImageUrl(text)) return { kind: 'image', url: text.trim() };
  return { kind: 'text', text };
};
