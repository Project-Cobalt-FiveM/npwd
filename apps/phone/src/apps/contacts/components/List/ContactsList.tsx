import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useText } from '../../hooks/useText';
import { ChatCircle, Copy, Phone, Plus, ShareNetwork, User, UsersThree } from '@phosphor-icons/react';
import { Avatar, EmptyState, Fab, IconButton } from '@ui/cobalt';
import { Contact, ContactEvents } from '@typings/contact';
import fetchNui from '@utils/fetchNui';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { useCall } from '@os/call/hooks/useCall';
import { setClipboard } from '@os/phone/hooks';
import { useDebounce } from '@os/phone/hooks/useDebounce';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useContactFilterInput, useFilteredContacts } from '../../hooks/state';
import { useOpenConversation } from '../../hooks/useOpenConversation';
import { avatarSource } from '../../utils/avatar';
import { SearchAppBar } from '../SearchAppBar';

interface LetterGroup {
  letter: string;
  contacts: Contact[];
}

const groupByLetter = (contacts: Contact[]): LetterGroup[] => {
  const sorted = [...contacts].sort((a, b) => a.display.localeCompare(b.display));
  return sorted.reduce<LetterGroup[]>((groups, contact) => {
    const first = contact.display.trim().charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : '#';
    const last = groups[groups.length - 1];
    if (last?.letter === letter) last.contacts.push(contact);
    else groups.push({ letter, contacts: [contact] });
    return groups;
  }, []);
};

const ghostButton =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-cb-muted-foreground transition-colors duration-150 ease-cb hover:bg-cb-secondary hover:text-cb-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary';

const MyNumberRow: React.FC = () => {
  const t = useText();
  const myNumber = useMyPhoneNumber();
  const { addAlert } = useSnackbar();

  const copyNumber = () => {
    setClipboard(myNumber);
    addAlert({ message: t('COBALT.CONTACTS.NUMBER_COPIED'), type: 'success' });
  };

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-cb-border pb-3 pl-5 pr-3 pt-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cb-secondary text-cb-muted-foreground">
        <User size={20} weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 text-cb-foreground">{t('COBALT.CONTACTS.MY_NUMBER')}</p>
        <p className="text-xs leading-4 tabular-nums text-cb-muted-foreground">{myNumber}</p>
      </div>
      <IconButton label={t('COBALT.CONTACTS.COPY_NUMBER')} onClick={copyNumber} className="h-9 w-9">
        <Copy size={20} weight="fill" />
      </IconButton>
      <IconButton
        label={t('COBALT.CONTACTS.SHARE_NUMBER')}
        onClick={() => fetchNui(ContactEvents.LOCAL_SHARE)}
        className="h-9 w-9"
      >
        <ShareNetwork size={20} weight="fill" />
      </IconButton>
    </div>
  );
};

const ContactRow: React.FC<{ contact: Contact; referral?: string }> = ({ contact, referral }) => {
  const t = useText();
  const { initializeCall } = useCall();
  const openConversation = useOpenConversation();
  const { id, display, number, avatar } = contact;

  const target = referral
    ? `${referral}?contact=${encodeURIComponent(JSON.stringify({ number, id, display }))}`
    : `/contacts/${id}`;

  return (
    <div className="flex items-center gap-3 rounded-md p-2 transition-colors duration-150 ease-cb hover:bg-cb-card">
      <Link
        to={target}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
      >
        <Avatar name={display} src={avatarSource(avatar)} size={36} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium leading-5 text-cb-foreground">{display}</span>
          <span className="block truncate text-xs leading-4 tabular-nums text-cb-muted-foreground">
            {number}
          </span>
        </span>
      </Link>
      {!referral && (
        <>
          <button
            type="button"
            aria-label={`${t('COBALT.CONTACTS.CALL')} ${display}`}
            title={t('COBALT.CONTACTS.CALL')}
            onClick={() => initializeCall(number)}
            className={ghostButton}
          >
            <Phone size={20} weight="fill" />
          </button>
          <button
            type="button"
            aria-label={`${t('COBALT.CONTACTS.MESSAGE')} ${display}`}
            title={t('COBALT.CONTACTS.MESSAGE')}
            onClick={() => openConversation(number)}
            className={ghostButton}
          >
            <ChatCircle size={20} weight="fill" />
          </button>
        </>
      )}
    </div>
  );
};

export const ContactsList: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const { referal: referral } = useQueryParams<{ referal?: string }>();
  const contacts = useFilteredContacts();
  const [filter, setFilter] = useContactFilterInput();
  const [query, setQuery] = useState(filter);
  const debouncedQuery = useDebounce<string>(query, 250);

  useEffect(() => {
    setFilter(debouncedQuery);
  }, [debouncedQuery, setFilter]);

  useEffect(() => () => setFilter(''), [setFilter]);

  const groups = groupByLetter(contacts);
  const addContact = () => history.push('/contacts/-1');

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <SearchAppBar
        title={t('COBALT.CONTACTS.TITLE')}
        searchLabel={t('COBALT.CONTACTS.SEARCH')}
        query={query}
        onQueryChange={setQuery}
      />
      {!query && <MyNumberRow />}
      {groups.length === 0 ? (
        <EmptyState
          icon={<UsersThree size={20} weight="fill" />}
          title={query ? t('COBALT.CONTACTS.NO_MATCHES') : t('COBALT.CONTACTS.EMPTY')}
          caption={query ? undefined : t('COBALT.CONTACTS.EMPTY_CAPTION')}
          action={query ? undefined : { label: t('COBALT.CONTACTS.ADD'), onClick: addContact }}
          className="flex-1 justify-center px-10 pb-12"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pb-24 pl-3 pr-1">
          {groups.map((group) => (
            <section key={group.letter} aria-label={group.letter}>
              <h2 className="px-2 pb-1 pt-3 text-xs font-semibold leading-4 text-cb-cobalt-foreground">
                {group.letter}
              </h2>
              {group.contacts.map((contact) => (
                <ContactRow key={contact.id} contact={contact} referral={referral} />
              ))}
            </section>
          ))}
        </div>
      )}
      {!referral && (
        <Fab
          label={t('COBALT.CONTACTS.ADD')}
          icon={<Plus size={24} weight="fill" />}
          onClick={addContact}
          className="bottom-5 right-5"
        />
      )}
    </div>
  );
};
