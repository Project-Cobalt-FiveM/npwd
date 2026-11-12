import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useText } from '../../hooks/useText';
import { User, X } from '@phosphor-icons/react';
import { Avatar, IconButton } from '@ui/cobalt';
import { NPWDInput } from '@ui/components';
import { Contact, ContactsDatabaseLimits } from '@typings/contact';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { useContactsAPI } from '../../hooks/useContactsAPI';
import { avatarSource } from '../../utils/avatar';

interface ContactFormQuery {
  addNumber?: string;
  name?: string;
  avatar?: string;
  referal?: string;
}

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  maxLength: number;
  placeholder?: string;
  numeric?: boolean;
  onChange: (value: string) => void;
}

const Field: React.FC<FieldProps> = ({ label, hint, value, maxLength, placeholder, numeric, onChange }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium leading-5 text-cb-foreground">
      {label}
      {hint && <span className="font-normal text-[#737373]"> {hint}</span>}
    </span>
    <NPWDInput
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      inputMode={numeric ? 'tel' : undefined}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-md border border-cb-input bg-cb-background px-3 py-0 text-sm leading-5 text-cb-foreground placeholder:text-[#737373] focus:border-cb-primary focus:shadow-[inset_0_0_0_1px_#5078D7] dark:bg-cb-background dark:text-cb-foreground"
    />
  </label>
);

export const ContactForm: React.FC<{ contact?: Contact }> = ({ contact }) => {
  const t = useText();
  const history = useHistory();
  const query = useQueryParams<ContactFormQuery>({ referal: '/contacts' });
  const { addNewContact, updateContact } = useContactsAPI();
  const [name, setName] = useState(contact?.display ?? query.name ?? '');
  const [number, setNumber] = useState(contact?.number ?? query.addNumber ?? '');
  const [avatar, setAvatar] = useState(avatarSource(contact?.avatar ?? query.avatar) ?? '');

  const canSave = name.trim() !== '' && number.trim() !== '';
  const photo = avatarSource(avatar);

  const save = () => {
    if (!canSave) return;
    const fields = { display: name.trim(), number: number.trim(), avatar: avatar.trim() };
    if (contact) updateContact({ id: contact.id, ...fields });
    else addNewContact(fields, query.referal ?? '/contacts');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-1 pl-1 pr-4">
        <IconButton label={t('COBALT.CONTACTS.CLOSE')} onClick={() => history.goBack()} className="h-12 w-12 text-cb-foreground">
          <X size={24} weight="fill" />
        </IconButton>
        <h1 className="min-w-0 flex-1 truncate pl-1 text-[22px] font-semibold leading-7 text-cb-foreground">
          {contact ? t('COBALT.CONTACTS.EDIT_TITLE') : t('COBALT.CONTACTS.CREATE_TITLE')}
        </h1>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="h-9 rounded-md bg-cb-primary px-4 text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb hover:bg-cb-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground disabled:bg-cb-secondary disabled:text-cb-muted-foreground"
        >
          {t('COBALT.CONTACTS.SAVE')}
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5 pt-3">
        <div className="flex items-center gap-4">
          {photo || name.trim() ? (
            <Avatar name={name.trim() || number} src={photo} size={64} />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cb-secondary text-[#737373]">
              <User size={28} weight="fill" />
            </div>
          )}
          <p className="max-w-[160px] text-xs leading-4 text-cb-muted-foreground">
            {t('COBALT.CONTACTS.PHOTO_HINT')}
          </p>
        </div>
        <Field
          label={t('COBALT.CONTACTS.NAME')}
          value={name}
          maxLength={ContactsDatabaseLimits.display - 1}
          onChange={setName}
        />
        <Field
          label={t('COBALT.CONTACTS.NUMBER')}
          value={number}
          maxLength={ContactsDatabaseLimits.number - 1}
          numeric
          onChange={setNumber}
        />
        <Field
          label={t('COBALT.CONTACTS.AVATAR_URL')}
          hint={t('COBALT.CONTACTS.OPTIONAL')}
          value={avatar}
          maxLength={ContactsDatabaseLimits.avatar - 1}
          placeholder="https://cdn.fivemesh.io/u/avatar.png"
          onChange={setAvatar}
        />
      </div>
    </div>
  );
};
