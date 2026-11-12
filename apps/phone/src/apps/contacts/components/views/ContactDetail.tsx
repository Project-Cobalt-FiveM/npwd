import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import { useText } from '../../hooks/useText';
import type { Icon } from '@phosphor-icons/react';
import {
  ChatCircle,
  Clock,
  CurrencyCircleDollar,
  PencilSimple,
  Phone,
  Trash,
} from '@phosphor-icons/react';
import { AppBar, Avatar, BottomSheet, IconButton } from '@ui/cobalt';
import { Contact } from '@typings/contact';
import { cn } from '@utils/css';
import { useCall } from '@os/call/hooks/useCall';
import { usePhone } from '@os/phone/hooks/usePhone';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useDialHistory } from '@apps/dialer/hooks/useDialHistory';
import { buildCallLog, CallLogEntry } from '@apps/dialer/utils/callLog';
import { useContactsAPI } from '../../hooks/useContactsAPI';
import { useOpenConversation } from '../../hooks/useOpenConversation';
import { avatarSource } from '../../utils/avatar';
import { SendMoneyDialog } from '../modals/SendMoneyDialog';

interface RoundActionProps {
  label: string;
  icon: Icon;
  primary?: boolean;
  onClick: () => void;
}

const RoundAction: React.FC<RoundActionProps> = ({ label, icon: ActionIcon, primary, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex flex-col items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
  >
    <span
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-full text-cb-foreground transition-[background-color,transform] duration-150 ease-cb group-active:scale-95',
        primary ? 'bg-cb-primary group-hover:bg-cb-primary-hover' : 'bg-cb-secondary group-hover:bg-cb-input',
      )}
    >
      <ActionIcon size={24} weight="fill" />
    </span>
    <span className="text-xs font-medium leading-4 text-cb-foreground">{label}</span>
  </button>
);

const useLastCall = (number: string): CallLogEntry | undefined => {
  const calls = useDialHistory();
  const myNumber = useMyPhoneNumber();
  return useMemo(
    () => buildCallLog(calls, myNumber).find((entry) => entry.peer === number && !entry.anonymous),
    [calls, myNumber, number],
  );
};

export const ContactDetail: React.FC<{ contact: Contact }> = ({ contact }) => {
  const t = useText();
  const history = useHistory();
  const { initializeCall } = useCall();
  const openConversation = useOpenConversation();
  const { deleteContact } = useContactsAPI();
  const { ResourceConfig } = usePhone();
  const lastCall = useLastCall(contact.number);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const canPay = Boolean(
    ResourceConfig?.general?.useResourceIntegration && ResourceConfig?.contacts?.frameworkPay,
  );

  const lastCallTitle = (startedAt: dayjs.Dayjs): string => {
    const time = startedAt.format('HH:mm');
    if (startedAt.isSame(dayjs(), 'day')) return t('COBALT.CONTACTS.TODAY_AT', { time });
    if (startedAt.isSame(dayjs().subtract(1, 'day'), 'day'))
      return t('COBALT.CONTACTS.YESTERDAY_AT', { time });
    return `${startedAt.format('DD/MM')}, ${time}`;
  };

  const lastCallCaption = (entry: CallLogEntry): string => {
    if (entry.kind === 'missed') return t('COBALT.CONTACTS.MISSED_CALL');
    if (entry.durationSeconds == null) return t('COBALT.CONTACTS.LAST_CALL');
    const duration =
      entry.durationSeconds >= 60
        ? t('COBALT.DIALER.DURATION_MIN', { count: Math.round(entry.durationSeconds / 60) })
        : t('COBALT.DIALER.DURATION_SEC', { count: entry.durationSeconds });
    return t('COBALT.CONTACTS.LAST_CALL_FOR', { duration });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <AppBar
        back
        className="px-1"
        title=""
        actions={
          <>
            <IconButton
              label={t('COBALT.CONTACTS.EDIT')}
              onClick={() => history.push(`/contacts/${contact.id}/edit`)}
              className="h-12 w-12"
            >
              <PencilSimple size={24} weight="fill" />
            </IconButton>
            <IconButton
              label={t('COBALT.CONTACTS.DELETE')}
              onClick={() => setConfirmDelete(true)}
              className="h-12 w-12"
            >
              <Trash size={24} weight="fill" />
            </IconButton>
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-4 px-5 pb-7 pt-6">
          <Avatar name={contact.display} src={avatarSource(contact.avatar)} size={96} />
          <div className="text-center">
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.01em] text-cb-foreground">
              {contact.display}
            </h2>
            <p className="text-sm leading-5 tabular-nums text-cb-muted-foreground">{contact.number}</p>
          </div>
        </div>
        <div className="flex justify-center gap-10 border-b border-cb-border px-5 pb-6">
          <RoundAction
            label={t('COBALT.CONTACTS.CALL')}
            icon={Phone}
            primary
            onClick={() => initializeCall(contact.number)}
          />
          <RoundAction
            label={t('COBALT.CONTACTS.TEXT')}
            icon={ChatCircle}
            onClick={() => openConversation(contact.number)}
          />
          {canPay && (
            <RoundAction
              label={t('COBALT.CONTACTS.PAY')}
              icon={CurrencyCircleDollar}
              onClick={() => setPayOpen(true)}
            />
          )}
        </div>
        <div className="flex flex-col py-2">
          <h3 className="px-5 py-2 text-sm font-semibold leading-5 text-cb-foreground">
            {t('COBALT.CONTACTS.CONTACT_INFO')}
          </h3>
          <div className="flex items-center gap-4 py-2.5 pl-5 pr-3">
            <Phone size={24} weight="fill" className="shrink-0 text-cb-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-5 tabular-nums text-cb-foreground">{contact.number}</p>
              <p className="text-xs leading-4 text-cb-muted-foreground">{t('COBALT.CONTACTS.MOBILE')}</p>
            </div>
            <IconButton
              label={t('COBALT.CONTACTS.MESSAGE')}
              onClick={() => openConversation(contact.number)}
            >
              <ChatCircle size={20} weight="fill" />
            </IconButton>
          </div>
          {lastCall && (
            <div className="flex items-center gap-4 py-2.5 pl-5 pr-3">
              <Clock size={24} weight="fill" className="shrink-0 text-cb-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-5 tabular-nums text-cb-foreground">
                  {lastCallTitle(lastCall.startedAt)}
                </p>
                <p className="text-xs leading-4 text-cb-muted-foreground">{lastCallCaption(lastCall)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <SendMoneyDialog open={payOpen} contact={contact} onClose={() => setPayOpen(false)} />
      <BottomSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('COBALT.CONTACTS.DELETE_TITLE', { name: contact.display })}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <p className="text-sm leading-5 text-cb-muted-foreground">{t('COBALT.CONTACTS.DELETE_CAPTION')}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="h-9 flex-1 rounded-md border border-cb-input bg-cb-secondary text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb hover:bg-cb-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
            >
              {t('COBALT.CONTACTS.CANCEL')}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                deleteContact({ id: contact.id });
              }}
              className="h-9 flex-1 rounded-md bg-cb-destructive text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground"
            >
              {t('COBALT.CONTACTS.DELETE_CONFIRM')}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
