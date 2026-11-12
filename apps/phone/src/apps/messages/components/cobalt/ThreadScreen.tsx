import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import qs from 'qs';
import {
  ArrowLeft,
  DotsThreeVertical,
  Phone,
  UserPlus,
  Users,
  UserCircle,
} from '@phosphor-icons/react';
import { Location, MessageEvents } from '@typings/messages';
import { Contact } from '@typings/contact';
import { IconButton } from '@ui/cobalt';
import fetchNui from '@utils/fetchNui';
import { useCall } from '@os/call/hooks/useCall';
import { usePhone } from '@os/phone/hooks';
import { useQueryParams } from '@common/hooks/useQueryParams';
import useMessages from '../../hooks/useMessages';
import { useMessagesState, useSetConversationId } from '../../hooks/state';
import { useMessageAPI } from '../../hooks/useMessageAPI';
import { useConversationDisplay } from '../../hooks/useConversationDisplay';
import { useContactActions } from '../../../contacts/hooks/useContactActions';
import GroupDetailsModal from '../modal/GroupDetailsModal';
import AudioContextMenu from '../modal/AudioContextMenu';
import { MessageNoteModal } from '../modal/MessageNoteModal';
import { ConversationAvatar } from './ConversationAvatar';
import { ThreadMessages } from './ThreadMessages';
import { Composer } from './Composer';
import { AttachKind, AttachSheet } from './AttachSheet';
import { ContactShareSheet } from './ContactShareSheet';
import { ActionSheet, SheetAction } from './ActionSheet';
import { useText } from '../../hooks/useText';

type Sheet = 'none' | 'attach' | 'contact' | 'more';

export const ThreadScreen: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const { pathname, search } = useLocation();
  const { groupId } = useParams<{ groupId: string }>();
  const conversationId = parseInt(groupId, 10);
  const query = useQueryParams<{ image?: string; note?: string }>();
  const { activeMessageConversation: conversation, setActiveMessageConversation } = useMessages();
  const setConversationId = useSetConversationId();
  const [messages, setMessages] = useMessagesState();
  const { fetchMessages, sendEmbedMessage } = useMessageAPI();
  const describe = useConversationDisplay();
  const { getContactByNumber } = useContactActions();
  const { initializeCall } = useCall();
  const { ResourceConfig } = usePhone();
  const [sheet, setSheet] = useState<Sheet>('none');
  const [recording, setRecording] = useState(false);
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [notePreview, setNotePreview] = useState(null);
  const [attachment, setAttachment] = useState<string | null>(null);

  useEffect(() => {
    setConversationId(conversationId);
    setActiveMessageConversation(conversationId);
  }, [conversationId, setActiveMessageConversation, setConversationId]);

  useEffect(() => {
    fetchMessages(groupId, 0);
    return () => setMessages(null);
  }, [groupId, fetchMessages, setMessages]);

  useEffect(() => {
    if (typeof query.image === 'string' && query.image) setAttachment(query.image);
  }, [query.image]);

  if (!conversation || conversation.id !== conversationId) {
    return <div className="flex-1 bg-cb-background" />;
  }

  const display = describe(conversation);
  const directNumber = conversation.isGroupChat ? null : display.members[0]?.number ?? null;
  const referal = qs.stringify({ referal: encodeURIComponent(pathname) });

  const clearAttachment = () => {
    setAttachment(null);
    const { image, ...rest } = qs.parse(search, { ignoreQueryPrefix: true });
    if (!image) return;
    const remaining = qs.stringify(rest);
    history.replace(remaining ? `${pathname}?${remaining}` : pathname);
  };

  const openContact = (number: string) => {
    const contact = getContactByNumber(number);
    const back = encodeURIComponent(pathname);
    if (contact) return history.push(`/contacts/${contact.id}/?referal=${back}`);
    history.push(`/contacts/-1/?addNumber=${number}&referal=${back}`);
  };

  const shareLocation = () =>
    fetchNui<{ data: Location }>(MessageEvents.GET_MESSAGE_LOCATION).then(({ data }) =>
      sendEmbedMessage({
        conversationId: conversation.id,
        conversationList: conversation.conversationList,
        embed: { type: 'location', ...data },
        tgtPhoneNumber: conversation.participant,
        message: t('MESSAGES.LOCATION_MESSAGE'),
      }),
    );

  const shareContact = (contact: Contact) =>
    sendEmbedMessage({
      conversationId: conversation.id,
      conversationList: conversation.conversationList,
      embed: { type: 'contact', ...contact },
      tgtPhoneNumber: conversation.participant,
      message: t('MESSAGES.CONTACT_SHARED'),
    });

  const handleAttach = (kind: AttachKind) => {
    switch (kind) {
      case 'camera':
        return history.push(`/camera?${referal}`);
      case 'gallery':
        return history.push(`/gallery?${referal}`);
      case 'note':
        return history.push(`/notes?${referal}`);
      case 'contact':
        return setSheet('contact');
      case 'location':
        return shareLocation();
      default: {
        const exhaustive: never = kind;
        return exhaustive;
      }
    }
  };

  const moreActions: SheetAction[] = conversation.isGroupChat
    ? [
        {
          label: t('COBALT.MESSAGES.GROUP_DETAILS'),
          icon: <Users size={22} weight="fill" />,
          onSelect: () => setGroupDetailsOpen(true),
        },
      ]
    : [
        display.contact
          ? {
              label: t('COBALT.MESSAGES.VIEW_CONTACT'),
              icon: <UserCircle size={22} weight="fill" />,
              onSelect: () => openContact(directNumber),
            }
          : {
              label: t('COBALT.MESSAGES.ADD_CONTACT'),
              icon: <UserPlus size={22} weight="fill" />,
              onSelect: () => openContact(directNumber),
            },
      ];

  const subtitle = conversation.isGroupChat
    ? t('COBALT.MESSAGES.PARTICIPANTS', { count: display.members.length + 1 })
    : display.contact
    ? directNumber
    : null;

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-cb-background font-sans">
      <header className="flex h-16 shrink-0 items-center gap-1 px-1 text-cb-foreground">
        <IconButton
          label={t('COBALT.BACK')}
          onClick={() => history.push('/messages')}
          className="h-12 w-12 text-cb-foreground"
        >
          <ArrowLeft size={24} weight="fill" />
        </IconButton>
        <ConversationAvatar display={display} isGroup={conversation.isGroupChat} size={36} />
        <div className="flex min-w-0 flex-1 flex-col pl-2">
          <span className="truncate text-base font-semibold leading-[22px]">{display.name}</span>
          {subtitle && (
            <span className="truncate text-xs tabular-nums leading-4 text-cb-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>
        {directNumber && (
          <IconButton
            label={t('GENERIC.CALL')}
            onClick={() => initializeCall(directNumber)}
            className="h-12 w-12"
          >
            <Phone size={24} weight="fill" />
          </IconButton>
        )}
        <IconButton
          label={t('COBALT.MESSAGES.MORE')}
          onClick={() => setSheet('more')}
          className="h-12 w-12"
        >
          <DotsThreeVertical size={24} weight="fill" />
        </IconButton>
      </header>

      {messages ? (
        <ThreadMessages
          key={conversation.id}
          conversationId={conversation.id}
          messages={messages}
          isGroup={conversation.isGroupChat}
        />
      ) : (
        <div className="min-h-0 flex-1" />
      )}

      {recording ? (
        <AudioContextMenu onClose={() => setRecording(false)} />
      ) : (
        <Composer
          conversation={conversation}
          attachment={attachment}
          onClearAttachment={clearAttachment}
          onAttach={() => setSheet('attach')}
          voiceEnabled={Boolean(ResourceConfig?.voiceMessage?.enabled)}
          onVoice={() => setRecording(true)}
        />
      )}

      <AttachSheet
        open={sheet === 'attach'}
        onClose={() => setSheet('none')}
        onPick={handleAttach}
      />
      <ContactShareSheet
        open={sheet === 'contact'}
        onClose={() => setSheet('none')}
        onShare={shareContact}
      />
      <ActionSheet open={sheet === 'more'} onClose={() => setSheet('none')} actions={moreActions} />
      <MessageNoteModal
        noteId={typeof query.note === 'string' ? query.note : undefined}
        notePreview={notePreview}
        setNotePreview={setNotePreview}
        messageGroup={conversation}
        onClose={() => setSheet('none')}
      />
      <GroupDetailsModal
        open={groupDetailsOpen}
        onClose={() => setGroupDetailsOpen(false)}
        conversationList={conversation.conversationList}
        addContact={openContact}
      />
    </div>
  );
};
