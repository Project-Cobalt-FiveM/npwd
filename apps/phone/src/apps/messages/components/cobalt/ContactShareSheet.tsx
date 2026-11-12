import React, { useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Contact } from '@typings/contact';
import { Avatar, BottomSheet } from '@ui/cobalt';
import { useContactsValue } from '../../../contacts/hooks/state';
import { usableAvatar } from '../../hooks/useConversationDisplay';
import { gameFocusProps } from '../../utils/gameFocus';
import { useText } from '../../hooks/useText';

interface ContactShareSheetProps {
  open: boolean;
  onClose: () => void;
  onShare: (contact: Contact) => void;
}

export const ContactShareSheet: React.FC<ContactShareSheetProps> = ({ open, onClose, onShare }) => {
  const t = useText();
  const contacts = useContactsValue();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...contacts]
      .filter(
        (c) => !needle || c.display.toLowerCase().includes(needle) || c.number.includes(needle),
      )
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [contacts, query]);

  return (
    <BottomSheet open={open} onClose={onClose} title={t('COBALT.MESSAGES.SHARE_CONTACT')}>
      <div className="mx-2 mb-2 flex h-11 items-center gap-2 rounded-full bg-cb-muted px-4 text-cb-muted-foreground">
        <MagnifyingGlass size={18} weight="fill" />
        <input
          {...gameFocusProps}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={t('COBALT.MESSAGES.SEARCH_CONTACTS')}
          aria-label={t('COBALT.MESSAGES.SEARCH_CONTACTS')}
          className="min-w-0 flex-1 bg-transparent text-sm text-cb-foreground placeholder:text-[#737373] focus:outline-none"
        />
      </div>
      <ul className="flex max-h-[320px] flex-col overflow-y-auto">
        {matches.map((contact) => (
          <li key={contact.id}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onShare(contact);
              }}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-2.5 text-left transition-colors duration-150 ease-cb active:bg-cb-secondary"
            >
              <Avatar name={contact.display} src={usableAvatar(contact.avatar)} size={40} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-base font-medium leading-6 text-cb-foreground">
                  {contact.display}
                </span>
                <span className="text-xs tabular-nums leading-4 text-cb-muted-foreground">
                  {contact.number}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
};
