import React from 'react';
import { MessageConversation } from '@typings/messages';
import { cn } from '@utils/css';
import { ConversationDisplay } from '../../hooks/useConversationDisplay';
import { useLongPress } from '../../hooks/useLongPress';
import { formatConversationTime } from '../../utils/time';
import { ConversationAvatar } from './ConversationAvatar';
import { useText } from '../../hooks/useText';

interface ConversationRowProps {
  conversation: MessageConversation;
  display: ConversationDisplay;
  selected: boolean;
  onPress: (conversation: MessageConversation) => void;
  onLongPress: (conversation: MessageConversation) => void;
}

export const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  display,
  selected,
  onPress,
  onLongPress,
}) => {
  const t = useText();
  const longPress = useLongPress(() => onLongPress(conversation));
  const unreadCount = conversation.unreadCount ?? 0;
  const unread = unreadCount > 0 && !selected;

  const summary = (): string => {
    if (unreadCount > 0) {
      return t('COBALT.MESSAGES.NEW_MESSAGES', { count: Math.min(unreadCount, 99) });
    }
    if (conversation.isGroupChat) {
      return t('COBALT.MESSAGES.PARTICIPANTS', { count: display.members.length + 1 });
    }
    return display.contact ? display.contact.number : t('COBALT.MESSAGES.NOT_IN_CONTACTS');
  };

  return (
    <button
      type="button"
      {...longPress}
      onClick={() => onPress(conversation)}
      aria-pressed={selected}
      className={cn(
        'flex w-full select-none items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cb-primary',
        selected ? 'bg-cb-primary' : 'active:bg-cb-muted',
      )}
    >
      <ConversationAvatar
        display={display}
        isGroup={conversation.isGroupChat}
        selected={selected}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-sm leading-5 text-cb-foreground',
              unread ? 'font-semibold' : 'font-medium',
            )}
          >
            {display.name}
          </span>
          {conversation.updatedAt != null && (
            <span
              className={cn(
                'shrink-0 text-xs tabular-nums leading-4',
                unread
                  ? 'font-medium text-cb-foreground'
                  : selected
                  ? 'text-cb-foreground'
                  : 'text-[#737373]',
              )}
            >
              {formatConversationTime(conversation.updatedAt, t)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-sm leading-5',
              unread || selected ? 'text-cb-foreground' : 'text-cb-muted-foreground',
              unread && 'font-medium',
            )}
          >
            {summary()}
          </span>
          {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-cb-primary" />}
        </div>
      </div>
    </button>
  );
};
