import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  ChatCircleText,
  ChatText,
  Checks,
  DotsThreeVertical,
  MagnifyingGlass,
  Trash,
  TrayArrowUp,
  XCircle,
} from '@phosphor-icons/react';
import { AppBar, EmptyState, ExtendedFab, IconButton } from '@ui/cobalt';
import { MessageConversation } from '@typings/messages';
import { useDebounce } from '@os/phone/hooks/useDebounce';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import {
  useCheckedConversations,
  useFilteredConversationsValue,
  useMessageConversationsValue,
  useSetFilterValue,
} from '../../hooks/state';
import { useMessageAPI } from '../../hooks/useMessageAPI';
import useMessages from '../../hooks/useMessages';
import { useConversationDisplay } from '../../hooks/useConversationDisplay';
import { useArchivedConversations } from '../../hooks/useArchivedConversations';
import { toMillis } from '../../utils/time';
import { gameFocusProps } from '../../utils/gameFocus';
import { ConversationRow } from './ConversationRow';
import { ActionSheet, SheetAction } from './ActionSheet';
import { useText } from '../../hooks/useText';

interface ConversationsScreenProps {
  archived?: boolean;
}

const byRecent = (a: MessageConversation, b: MessageConversation): number =>
  toMillis(b.updatedAt ?? 0) - toMillis(a.updatedAt ?? 0);

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({ archived = false }) => {
  const t = useText();
  const history = useHistory();
  const { addAlert } = useSnackbar();
  const conversations = useMessageConversationsValue();
  const filtered = useFilteredConversationsValue();
  const setFilter = useSetFilterValue();
  const [checked, setChecked] = useCheckedConversations();
  const { setMessageRead, deleteConversation } = useMessageAPI();
  const { goToConversation } = useMessages();
  const describe = useConversationDisplay();
  const { archivedIds, archive, unarchive } = useArchivedConversations(conversations);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const debouncedQuery = useDebounce<string>(query, 200);

  useEffect(() => setFilter(debouncedQuery), [debouncedQuery, setFilter]);

  useEffect(
    () => () => {
      setChecked([]);
      setFilter('');
    },
    [setChecked, setFilter],
  );

  const visible = useMemo(
    () => filtered.filter((c) => archivedIds.includes(c.id) === archived).sort(byRecent),
    [filtered, archivedIds, archived],
  );

  const selecting = checked.length > 0;

  const toggle = (conversation: MessageConversation) =>
    setChecked((current) =>
      current.includes(conversation.id)
        ? current.filter((id) => id !== conversation.id)
        : [...current, conversation.id],
    );

  const open = (conversation: MessageConversation) => {
    if (selecting) return toggle(conversation);
    setMessageRead(conversation.id);
    goToConversation(conversation);
  };

  const closeSearch = () => {
    setSearching(false);
    setQuery('');
  };

  const archiveSelected = () => {
    if (archived) {
      unarchive(checked);
      addAlert({
        message: t('COBALT.MESSAGES.UNARCHIVED', { count: checked.length }),
        type: 'success',
      });
    } else {
      archive(checked);
      addAlert({
        message: t('COBALT.MESSAGES.ARCHIVED_COUNT', { count: checked.length }),
        type: 'success',
      });
    }
    setChecked([]);
  };

  const deleteSelected = () => {
    deleteConversation(checked);
    unarchive(checked);
    setChecked([]);
  };

  const menuActions: SheetAction[] = [
    {
      label: t('COBALT.MESSAGES.ARCHIVED'),
      icon: <Archive size={22} weight="fill" />,
      onSelect: () => history.push('/messages/archived'),
    },
    {
      label: t('COBALT.MESSAGES.MARK_ALL_READ'),
      icon: <Checks size={22} weight="fill" />,
      onSelect: () =>
        conversations.filter((c) => c.unreadCount > 0).forEach((c) => setMessageRead(c.id)),
    },
  ];

  const header = (): React.ReactNode => {
    if (selecting) {
      return (
        <header className="flex h-16 shrink-0 items-center gap-1 bg-cb-muted pl-1 pr-2 text-cb-foreground">
          <IconButton
            label={t('COBALT.MESSAGES.CLEAR_SELECTION')}
            onClick={() => setChecked([])}
            className="h-12 w-12"
          >
            <XCircle size={24} weight="fill" />
          </IconButton>
          <span className="flex-1 pl-2 text-[22px] font-semibold tabular-nums leading-7">
            {checked.length}
          </span>
          <IconButton
            label={archived ? t('COBALT.MESSAGES.UNARCHIVE') : t('COBALT.MESSAGES.ARCHIVE')}
            onClick={archiveSelected}
            className="h-12 w-12 text-cb-foreground"
          >
            {archived ? (
              <TrayArrowUp size={24} weight="fill" />
            ) : (
              <Archive size={24} weight="fill" />
            )}
          </IconButton>
          <IconButton
            label={t('COBALT.MESSAGES.DELETE')}
            onClick={deleteSelected}
            className="h-12 w-12 text-cb-foreground"
          >
            <Trash size={24} weight="fill" />
          </IconButton>
        </header>
      );
    }

    if (searching) {
      return (
        <header className="flex h-16 shrink-0 items-center gap-1 bg-cb-background px-1 text-cb-foreground">
          <IconButton label={t('COBALT.BACK')} onClick={closeSearch} className="h-12 w-12">
            <ArrowLeft size={22} weight="fill" />
          </IconButton>
          <input
            {...gameFocusProps}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={t('COBALT.MESSAGES.SEARCH')}
            aria-label={t('COBALT.MESSAGES.SEARCH')}
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-cb-foreground placeholder:text-[#737373] focus:outline-none"
          />
          {query && (
            <IconButton
              label={t('COBALT.CLEAR_SEARCH')}
              onClick={() => setQuery('')}
              className="h-12 w-12"
            >
              <XCircle size={22} weight="fill" />
            </IconButton>
          )}
        </header>
      );
    }

    return (
      <AppBar
        title={archived ? t('COBALT.MESSAGES.ARCHIVED') : t('APPS_MESSAGES')}
        onBack={archived ? () => history.push('/messages') : undefined}
        actions={
          <>
            <IconButton
              label={t('COBALT.MESSAGES.SEARCH')}
              onClick={() => setSearching(true)}
              className="h-12 w-12"
            >
              <MagnifyingGlass size={24} weight="fill" />
            </IconButton>
            {!archived && (
              <IconButton
                label={t('COBALT.MESSAGES.MORE')}
                onClick={() => setMenuOpen(true)}
                className="h-12 w-12"
              >
                <DotsThreeVertical size={24} weight="fill" />
              </IconButton>
            )}
          </>
        }
      />
    );
  };

  const empty = (): React.ReactNode => {
    if (debouncedQuery) {
      return (
        <EmptyState
          icon={<MagnifyingGlass size={22} weight="fill" />}
          title={t('COBALT.MESSAGES.NO_MATCHES')}
        />
      );
    }
    if (archived) {
      return (
        <EmptyState
          icon={<Archive size={22} weight="fill" />}
          title={t('COBALT.MESSAGES.NO_ARCHIVED')}
        />
      );
    }
    return (
      <EmptyState
        icon={<ChatCircleText size={22} weight="fill" />}
        title={t('COBALT.MESSAGES.EMPTY_TITLE')}
        caption={t('COBALT.MESSAGES.EMPTY_CAPTION')}
      />
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-cb-background font-sans">
      {header()}
      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        {visible.length === 0
          ? empty()
          : visible.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                display={describe(conversation)}
                selected={checked.includes(conversation.id)}
                onPress={open}
                onLongPress={toggle}
              />
            ))}
      </div>
      {!archived && !selecting && (
        <ExtendedFab
          label={t('COBALT.MESSAGES.START_CHAT')}
          icon={<ChatText size={24} weight="fill" />}
          onClick={() => history.push('/messages/new')}
        />
      )}
      <ActionSheet open={menuOpen} onClose={() => setMenuOpen(false)} actions={menuActions} />
    </div>
  );
};
