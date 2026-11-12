import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DownloadSimple, Trash } from '@phosphor-icons/react';
import { Message, MessageEvents } from '@typings/messages';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { usePhotoAPI } from '@apps/camera/hooks/usePhotoAPI';
import { useSetMessages } from '../../hooks/state';
import { useMessageAPI } from '../../hooks/useMessageAPI';
import { useMember } from '../../hooks/useConversationDisplay';
import { MessageBody, parseMessageBody } from '../../utils/embed';
import { dayKey, formatDaySeparator, formatMessageTime } from '../../utils/time';
import { ThreadBubble } from './ThreadBubble';
import { ActionSheet, SheetAction } from './ActionSheet';
import { useText } from '../../hooks/useText';

export const THREAD_SCROLL_ID = 'cobalt-messages-thread';

interface ThreadMessagesProps {
  conversationId: number;
  messages: Message[];
  isGroup: boolean;
}

type ThreadItem =
  | { kind: 'day'; key: string; label: string }
  | {
      kind: 'message';
      key: string;
      message: Message;
      body: MessageBody;
      mine: boolean;
      sender: string | null;
      startsRun: boolean;
    };

export const ThreadMessages: React.FC<ThreadMessagesProps> = ({
  conversationId,
  messages,
  isGroup,
}) => {
  const t = useText();
  const history = useHistory();
  const { addAlert } = useSnackbar();
  const myNumber = useMyPhoneNumber();
  const toMember = useMember();
  const setMessages = useSetMessages();
  const { deleteMessage } = useMessageAPI();
  const { saveImage } = usePhotoAPI();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(messages.length > 0);
  const [revealedId, setRevealedId] = useState<number | null>(null);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const items = useMemo(() => {
    const result: ThreadItem[] = [];
    messages.forEach((message, index) => {
      const previous = messages[index - 1];
      const day = dayKey(message.createdAt);
      const newDay = !previous || dayKey(previous.createdAt) !== day;
      if (newDay) {
        result.push({
          kind: 'day',
          key: `day-${day}`,
          label: formatDaySeparator(message.createdAt, t),
        });
      }
      const mine = message.author === myNumber;
      const startsRun = newDay || previous.author !== message.author;
      result.push({
        kind: 'message',
        key: `message-${message.id}`,
        message,
        body: parseMessageBody(message),
        mine,
        sender: isGroup && !mine && startsRun ? toMember(message.author).name : null,
        startsRun,
      });
    });
    return result;
  }, [messages, myNumber, isGroup, toMember, t]);

  const lastId = messages[messages.length - 1]?.id;

  const loadOlder = useCallback(() => {
    fetchNui<ServerPromiseResp<Message[]>>(MessageEvents.FETCH_MESSAGES, {
      conversationId,
      page,
    }).then((resp) => {
      if (resp?.status !== 'ok') {
        addAlert({ message: t('MESSAGES.FEEDBACK.FETCHED_MESSAGES_FAILED'), type: 'error' });
        return history.push('/messages');
      }
      const older = resp.data ?? [];
      if (older.length === 0) return setHasMore(false);
      setPage((current) => current + 1);
      setMessages((current) => [...older, ...current]);
    });
  }, [addAlert, conversationId, history, page, setMessages, t]);

  const menuActions = (): SheetAction[] => {
    if (!menuMessage) return [];
    const body = parseMessageBody(menuMessage);
    const actions: SheetAction[] = [];
    if (body.kind === 'image') {
      actions.push({
        label: t('COBALT.MESSAGES.SAVE_IMAGE'),
        icon: <DownloadSimple size={22} weight="fill" />,
        onSelect: () => saveImage(body.url),
      });
    }
    if (menuMessage.author === myNumber) {
      actions.push({
        label: t('MESSAGES.FEEDBACK.DELETE_MESSAGE'),
        icon: <Trash size={22} weight="fill" />,
        destructive: true,
        onSelect: () => deleteMessage(menuMessage),
      });
    }
    return actions;
  };

  const openMenu = (message: Message) => {
    const body = parseMessageBody(message);
    if (body.kind !== 'image' && message.author !== myNumber) return;
    setMenuMessage(message);
    setMenuOpen(true);
  };

  return (
    <>
      <div id={THREAD_SCROLL_ID} className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto">
        <InfiniteScroll
          next={loadOlder}
          scrollableTarget={THREAD_SCROLL_ID}
          hasMore={hasMore}
          inverse
          loader={null}
          dataLength={messages.length}
          style={{ overflow: 'visible' }}
          className="flex flex-col gap-1 px-4 py-3"
        >
          {items.map((item) => {
            if (item.kind === 'day') {
              return (
                <div key={item.key} className="flex justify-center pb-1 pt-2">
                  <span className="text-xs font-medium leading-4 text-[#737373]">{item.label}</span>
                </div>
              );
            }
            const showTime = item.message.id === lastId || item.message.id === revealedId;
            return (
              <div
                key={item.key}
                className={cn(
                  'flex flex-col gap-0.5',
                  item.mine ? 'items-end' : 'items-start',
                  item.startsRun && 'mt-1',
                )}
              >
                {item.sender && (
                  <span className="pl-4 text-xs font-medium leading-4 text-cb-muted-foreground">
                    {item.sender}
                  </span>
                )}
                <ThreadBubble
                  message={item.message}
                  body={item.body}
                  mine={item.mine}
                  onTap={(message) =>
                    setRevealedId((current) => (current === message.id ? null : message.id))
                  }
                  onLongPress={openMenu}
                />
                {showTime && (
                  <span className="px-1 pt-0.5 text-xs tabular-nums leading-4 text-[#737373]">
                    {formatMessageTime(item.message.createdAt)}
                  </span>
                )}
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
      <ActionSheet open={menuOpen} onClose={() => setMenuOpen(false)} actions={menuActions()} />
    </>
  );
};
