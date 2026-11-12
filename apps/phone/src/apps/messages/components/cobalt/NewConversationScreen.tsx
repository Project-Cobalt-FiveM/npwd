import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CheckCircle, PlusCircle, UsersThree, XCircle } from '@phosphor-icons/react';
import { AppBar, Avatar } from '@ui/cobalt';
import { Contact } from '@typings/contact';
import { cn } from '@utils/css';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useContactsValue } from '../../../contacts/hooks/state';
import { useMessageConversationsValue } from '../../hooks/state';
import {
  findDirectConversation,
  Member,
  usableAvatar,
  useMember,
} from '../../hooks/useConversationDisplay';
import { useStartConversation } from '../../hooks/useStartConversation';
import { gameFocusProps } from '../../utils/gameFocus';
import { toMillis } from '../../utils/time';
import { useText } from '../../hooks/useText';

type Mode = 'direct' | 'group';

const topContactLimit = 4;
const numberPattern = /^[\d\s()+-]{3,}$/;

const sectionClass = 'px-4 pb-1 pt-3 text-sm font-medium leading-5 text-cb-cobalt-foreground';
const rowClass =
  'flex w-full items-center gap-4 px-4 py-2.5 text-left transition-colors duration-150 ease-cb active:bg-cb-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cb-primary';

const Chip: React.FC<{ member: Member; onRemove: () => void; removeLabel: string }> = ({
  member,
  onRemove,
  removeLabel,
}) => (
  <span className="flex h-8 items-center gap-1.5 rounded-full border border-cb-input bg-cb-secondary pl-1 pr-1">
    <Avatar name={member.name} src={member.avatar} size={20} />
    <span className="max-w-[120px] truncate text-[13px] font-medium leading-4 text-cb-foreground">
      {member.name}
    </span>
    <button
      type="button"
      aria-label={`${removeLabel} ${member.name}`}
      onClick={onRemove}
      className="flex h-6 w-6 items-center justify-center rounded-full text-cb-muted-foreground hover:text-cb-foreground"
    >
      <XCircle size={16} weight="fill" />
    </button>
  </span>
);

const ContactRow: React.FC<{ contact: Contact; selected: boolean; onPress: () => void }> = ({
  contact,
  selected,
  onPress,
}) => (
  <button type="button" onClick={onPress} aria-pressed={selected} className={rowClass}>
    {selected ? (
      <CheckCircle size={40} weight="fill" className="shrink-0 text-cb-primary" />
    ) : (
      <Avatar name={contact.display} src={usableAvatar(contact.avatar)} size={40} />
    )}
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-base font-medium leading-6 text-cb-foreground">
        {contact.display}
      </span>
      <span className="text-xs tabular-nums leading-4 text-cb-muted-foreground">
        {contact.number}
      </span>
    </span>
  </button>
);

export const NewConversationScreen: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const params = useParams<{ phoneNumber?: string }>();
  const query = useQueryParams<{ to?: string; phoneNumber?: string; image?: string }>();
  const myNumber = useMyPhoneNumber();
  const contacts = useContactsValue();
  const conversations = useMessageConversationsValue();
  const toMember = useMember();
  const { openDirect, createGroup } = useStartConversation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('direct');
  const [chips, setChips] = useState<Member[]>([]);
  const [text, setText] = useState('');
  const [groupName, setGroupName] = useState('');

  const prefillNumber = [query.to, query.phoneNumber, params.phoneNumber].find(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  const prefillImage = typeof query.image === 'string' && query.image ? query.image : undefined;
  const threadQuery = prefillImage ? { image: prefillImage } : {};
  const opened = useRef(false);

  useEffect(() => {
    if (!prefillNumber || opened.current) return;
    opened.current = true;
    openDirect(prefillNumber, prefillImage ? { image: prefillImage } : {});
  }, [prefillNumber, prefillImage, openDirect]);

  const needle = text.trim().toLowerCase();
  const trimmed = text.trim();
  const typedNumber = numberPattern.test(trimmed) ? trimmed : null;
  const chipNumbers = chips.map((chip) => chip.number);

  const sorted = useMemo(
    () =>
      [...contacts]
        .filter((c) => c.number !== myNumber)
        .sort((a, b) => a.display.localeCompare(b.display)),
    [contacts, myNumber],
  );

  const topContacts = useMemo(
    () =>
      [...conversations]
        .filter((c) => !c.isGroupChat)
        .sort((a, b) => toMillis(b.updatedAt ?? 0) - toMillis(a.updatedAt ?? 0))
        .map((c) => sorted.find((contact) => findDirectConversation([c], myNumber, contact.number)))
        .filter((contact): contact is Contact => Boolean(contact))
        .slice(0, topContactLimit),
    [conversations, sorted, myNumber],
  );

  const matches = needle
    ? sorted.filter((c) => c.display.toLowerCase().includes(needle) || c.number.includes(needle))
    : sorted.filter((c) => !topContacts.includes(c));

  if (prefillNumber) return <div className="flex-1 bg-cb-background" />;

  const addChip = (number: string) => {
    if (number === myNumber || chipNumbers.includes(number)) return;
    setChips((current) => [...current, toMember(number)]);
    setText('');
    inputRef.current?.focus();
  };

  const removeChip = (number: string) =>
    setChips((current) => current.filter((chip) => chip.number !== number));

  const pick = (number: string) => {
    if (mode === 'direct') return openDirect(number, threadQuery);
    if (chipNumbers.includes(number)) return removeChip(number);
    addChip(number);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && typedNumber) {
      event.preventDefault();
      pick(typedNumber);
    }
    if (event.key === 'Backspace' && !text && chips.length) {
      setChips((current) => current.slice(0, -1));
    }
  };

  const back = () => {
    if (mode === 'direct') return history.goBack();
    setMode('direct');
    setChips([]);
    setGroupName('');
  };

  const canCreate = chips.length > 1 && groupName.trim().length > 0;

  const submitGroup = () => {
    if (canCreate) createGroup(chipNumbers, groupName.trim(), threadQuery);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-cb-background font-sans">
      <AppBar
        title={
          mode === 'group' ? t('COBALT.MESSAGES.NEW_GROUP') : t('COBALT.MESSAGES.NEW_CONVERSATION')
        }
        onBack={back}
      />
      <div className="mx-4 flex min-h-[56px] shrink-0 flex-wrap items-center gap-2 border-b border-cb-secondary px-4 py-2.5">
        <span className="pr-0.5 text-base leading-6 text-cb-muted-foreground">
          {t('COBALT.MESSAGES.TO')}
        </span>
        {chips.map((chip) => (
          <Chip
            key={chip.number}
            member={chip}
            removeLabel={t('COBALT.MESSAGES.REMOVE')}
            onRemove={() => removeChip(chip.number)}
          />
        ))}
        <input
          {...gameFocusProps}
          ref={inputRef}
          autoFocus
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder={chips.length ? '' : t('COBALT.MESSAGES.NAME_OR_NUMBER')}
          aria-label={t('COBALT.MESSAGES.NAME_OR_NUMBER')}
          className="h-7 min-w-[80px] flex-1 bg-transparent text-base leading-6 text-cb-foreground placeholder:text-[#737373] focus:outline-none"
        />
      </div>

      {prefillImage && (
        <div className="mx-4 flex shrink-0 items-center gap-3 border-b border-cb-secondary py-2.5">
          <img src={prefillImage} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          <span className="text-sm leading-5 text-cb-muted-foreground">
            {t('COBALT.MESSAGES.PHOTO_READY')}
          </span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {mode === 'direct' && !needle && (
          <button type="button" onClick={() => setMode('group')} className={cn(rowClass, 'py-3')}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cb-primary text-cb-foreground">
              <UsersThree size={22} weight="fill" />
            </span>
            <span className="text-base font-medium leading-6 text-cb-foreground">
              {t('COBALT.MESSAGES.CREATE_GROUP')}
            </span>
          </button>
        )}

        {typedNumber && !sorted.some((c) => c.number === typedNumber) && (
          <button type="button" onClick={() => pick(typedNumber)} className={rowClass}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cb-secondary text-cb-muted-foreground">
              <PlusCircle size={22} weight="fill" />
            </span>
            <span className="min-w-0 flex-1 truncate text-base font-medium leading-6 text-cb-foreground">
              {t('COBALT.MESSAGES.SEND_TO_NUMBER', { number: typedNumber })}
            </span>
          </button>
        )}

        {!needle && topContacts.length > 0 && (
          <>
            <p className={sectionClass}>{t('COBALT.MESSAGES.TOP_CONTACTS')}</p>
            {topContacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                selected={chipNumbers.includes(contact.number)}
                onPress={() => pick(contact.number)}
              />
            ))}
          </>
        )}

        {matches.length > 0 && (
          <>
            {!needle && <p className={sectionClass}>{t('COBALT.MESSAGES.ALL_CONTACTS')}</p>}
            {matches.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                selected={chipNumbers.includes(contact.number)}
                onPress={() => pick(contact.number)}
              />
            ))}
          </>
        )}
      </div>

      {mode === 'group' && (
        <div className="flex shrink-0 items-center gap-2 border-t border-cb-secondary px-2 pb-2.5 pt-2">
          <input
            {...gameFocusProps}
            value={groupName}
            onChange={(event) => setGroupName(event.currentTarget.value)}
            onKeyDown={(event) => event.key === 'Enter' && submitGroup()}
            placeholder={t('COBALT.MESSAGES.GROUP_NAME')}
            aria-label={t('COBALT.MESSAGES.GROUP_NAME')}
            className="h-11 min-w-0 flex-1 rounded-full border border-cb-input bg-cb-muted px-[18px] text-sm text-cb-foreground placeholder:text-[#737373] focus:outline-none focus-visible:border-cb-primary"
          />
          <button
            type="button"
            disabled={!canCreate}
            onClick={submitGroup}
            className={cn(
              'h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground',
              canCreate
                ? 'bg-cb-primary text-cb-foreground hover:bg-cb-primary-hover'
                : 'bg-cb-secondary text-[#737373]',
            )}
          >
            {t('COBALT.MESSAGES.CREATE')}
          </button>
        </div>
      )}
    </div>
  );
};
