import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'qs';
import { Note, Pause, Play, UserPlus } from '@phosphor-icons/react';
import { Avatar } from '@ui/cobalt';
import { MessageEvents } from '@typings/messages';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { useAudioPlayer } from '@os/audio/hooks/useAudioPlayer';
import { useContactActions } from '../../../contacts/hooks/useContactActions';
import { usableAvatar } from '../../hooks/useConversationDisplay';
import { MessageEmbed } from '../../utils/embed';
import { useText } from '../../hooks/useText';

type EmbedOf<T extends MessageEmbed['type']> = Extract<MessageEmbed, { type: T }>;

const cardClass = 'flex w-[232px] flex-col overflow-hidden rounded-[20px] text-left';

const MapArt: React.FC = () => (
  <svg width="232" height="104" viewBox="0 0 232 104" aria-hidden className="block shrink-0">
    <rect width="232" height="104" fill="#1C1C1C" />
    <rect x="150" width="82" height="44" fill="#14532D" />
    <rect y="80" width="232" height="24" fill="#0C4A6E" />
    <rect y="44" width="232" height="8" fill="#2E2E2E" />
    <rect x="60" width="8" height="80" fill="#2E2E2E" />
    <rect x="138" width="6" height="80" fill="#2E2E2E" />
    <path
      d="M104 22a12 12 0 0 0-12 12c0 9 10.6 21 11 21.5a1.4 1.4 0 0 0 2 0c.4-.5 11-12.5 11-21.5a12 12 0 0 0-12-12z"
      fill="#5078D7"
    />
    <circle cx="104" cy="34" r="4" fill="#FAFAFA" />
  </svg>
);

export const LocationCard: React.FC<{
  embed: EmbedOf<'location'>;
  text: string;
  mine: boolean;
}> = ({ embed, text, mine }) => {
  const t = useText();

  return (
    <button
      type="button"
      onClick={() => fetchNui(MessageEvents.MESSAGES_SET_WAYPOINT, { coords: embed.coords })}
      className={cn(cardClass, mine ? 'bg-cb-primary' : 'bg-cb-secondary')}
    >
      <MapArt />
      <span className="flex flex-col py-2 pl-3.5 pr-3">
        <span className="text-sm font-medium leading-5 text-cb-foreground">
          {text || t('MESSAGES.LOCATION_MESSAGE')}
        </span>
        <span
          className={cn(
            'text-xs leading-4',
            mine ? 'text-cb-foreground' : 'text-cb-muted-foreground',
          )}
        >
          {t('COBALT.MESSAGES.LOCATION_CAPTION')}
        </span>
      </span>
    </button>
  );
};

export const ContactCard: React.FC<{ embed: EmbedOf<'contact'>; mine: boolean }> = ({
  embed,
  mine,
}) => {
  const t = useText();
  const history = useHistory();
  const { pathname } = useLocation();
  const { getContactByNumber } = useContactActions();
  const name = embed.display || embed.number;
  const canAdd = !mine && !getContactByNumber(embed.number);

  const addContact = () =>
    history.push(
      `/contacts/-1?${qs.stringify({
        addNumber: embed.number,
        name: embed.display,
        referal: pathname,
      })}`,
    );

  return (
    <div className={cn(cardClass, mine ? 'bg-cb-primary' : 'bg-cb-secondary')}>
      <div className="flex items-center gap-3 px-3.5 py-3">
        <Avatar name={name} src={usableAvatar(embed.avatar)} size={40} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium leading-5 text-cb-foreground">{name}</span>
          <span
            className={cn(
              'text-xs tabular-nums leading-4',
              mine ? 'text-cb-foreground' : 'text-cb-muted-foreground',
            )}
          >
            {embed.number}
          </span>
        </div>
      </div>
      {canAdd && (
        <button
          type="button"
          onClick={addContact}
          className="flex h-11 items-center justify-center gap-2 border-t border-cb-input text-sm font-medium text-cb-cobalt-foreground transition-colors duration-150 ease-cb active:bg-cb-input"
        >
          <UserPlus size={18} weight="fill" />
          {t('COBALT.MESSAGES.ADD_CONTACT')}
        </button>
      )}
    </div>
  );
};

export const NoteCard: React.FC<{ embed: EmbedOf<'note'>; mine: boolean }> = ({ embed, mine }) => {
  const history = useHistory();
  const { pathname } = useLocation();

  const openNote = () =>
    history.push(
      `/notes/?${qs.stringify({
        title: embed.title,
        content: embed.content,
      })}&referal=${encodeURIComponent(pathname)}`,
    );

  return (
    <button
      type="button"
      onClick={openNote}
      className={cn(
        cardClass,
        'flex-row items-start gap-3 px-3.5 py-3',
        mine ? 'bg-cb-primary' : 'bg-cb-secondary',
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CA8A04] text-cb-foreground">
        <Note size={20} weight="fill" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium leading-5 text-cb-foreground">
          {embed.title}
        </span>
        <span
          className={cn(
            'line-clamp-2 text-xs leading-4',
            mine ? 'text-cb-foreground' : 'text-cb-muted-foreground',
          )}
        >
          {embed.content}
        </span>
      </span>
    </button>
  );
};

const formatSeconds = (seconds: number): string => {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export const AudioCard: React.FC<{ embed: EmbedOf<'audio'>; mine: boolean }> = ({
  embed,
  mine,
}) => {
  const t = useText();
  const { play, pause, playing, currentTime, duration } = useAudioPlayer(embed.url);
  const progress =
    Number.isFinite(duration) && duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div
      className={cn(
        'flex w-[232px] items-center gap-3 rounded-[20px] py-2 pl-2 pr-4',
        mine ? 'bg-cb-primary' : 'bg-cb-secondary',
      )}
    >
      <button
        type="button"
        aria-label={playing ? t('COBALT.MESSAGES.PAUSE') : t('COBALT.MESSAGES.PLAY')}
        onClick={playing ? pause : play}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cb-foreground',
          mine ? 'text-cb-primary' : 'text-cb-secondary',
        )}
      >
        {playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
      </button>
      <div
        className={cn(
          'h-1 flex-1 overflow-hidden rounded-full',
          mine ? 'bg-cb-primary-hover' : 'bg-cb-input',
        )}
      >
        <div
          className="h-full rounded-full bg-cb-foreground"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-cb-foreground">
        {formatSeconds(playing || currentTime > 0 ? currentTime : duration)}
      </span>
    </div>
  );
};
