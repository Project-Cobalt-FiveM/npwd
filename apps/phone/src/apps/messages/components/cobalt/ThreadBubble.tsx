import React from 'react';
import { Message } from '@typings/messages';
import { PictureReveal } from '@ui/components/PictureReveal';
import { cn } from '@utils/css';
import { useLongPress } from '../../hooks/useLongPress';
import { MessageBody } from '../../utils/embed';
import { AudioCard, ContactCard, LocationCard, NoteCard } from './EmbedCards';

interface ThreadBubbleProps {
  message: Message;
  body: MessageBody;
  mine: boolean;
  onTap: (message: Message) => void;
  onLongPress: (message: Message) => void;
}

const BubbleContent: React.FC<{ body: MessageBody; mine: boolean }> = ({ body, mine }) => {
  switch (body.kind) {
    case 'text':
      return (
        <div
          className={cn(
            'max-w-[272px] whitespace-pre-wrap break-words rounded-[20px] px-4 py-2.5 text-sm leading-5 text-cb-foreground',
            mine ? 'bg-cb-primary' : 'bg-cb-secondary',
          )}
        >
          {body.text}
        </div>
      );
    case 'image':
      return (
        <div
          className={cn('w-[232px] rounded-[20px] p-1', mine ? 'bg-cb-primary' : 'bg-cb-secondary')}
        >
          <PictureReveal>
            <img
              src={body.url}
              alt=""
              className="block max-h-[296px] w-full rounded-2xl object-cover"
            />
          </PictureReveal>
        </div>
      );
    case 'embed': {
      const { embed } = body;
      switch (embed.type) {
        case 'location':
          return <LocationCard embed={embed} text={body.text} mine={mine} />;
        case 'contact':
          return <ContactCard embed={embed} mine={mine} />;
        case 'note':
          return <NoteCard embed={embed} mine={mine} />;
        case 'audio':
          return <AudioCard embed={embed} mine={mine} />;
        default: {
          const exhaustive: never = embed;
          return exhaustive;
        }
      }
    }
    default: {
      const exhaustive: never = body;
      return exhaustive;
    }
  }
};

export const ThreadBubble: React.FC<ThreadBubbleProps> = ({
  message,
  body,
  mine,
  onTap,
  onLongPress,
}) => {
  const longPress = useLongPress(() => onLongPress(message));

  return (
    <div
      {...longPress}
      onClick={() => onTap(message)}
      className={cn('flex max-w-full select-none', mine ? 'self-end' : 'self-start')}
    >
      <BubbleContent body={body} mine={mine} />
    </div>
  );
};
