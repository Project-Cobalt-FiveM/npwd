import React, { useState } from 'react';
import { useText } from '../../hooks/useText';
import { XCircle } from '@phosphor-icons/react';
import { IconButton, usePresence } from '@ui/cobalt';
import { NPWDInput } from '@ui/components';
import { toggleKeys } from '@ui/components/Input';
import { Contact } from '@typings/contact';
import { cn } from '@utils/css';
import { useContactsAPI } from '../../hooks/useContactsAPI';

interface SendMoneyDialogProps {
  open: boolean;
  contact: Contact;
  onClose: () => void;
}

const maxAmountDigits = 9;

export const SendMoneyDialog: React.FC<SendMoneyDialogProps> = ({ open, contact, onClose }) => {
  const t = useText();
  const { payContact } = useContactsAPI();
  const { mounted, shown } = usePresence(open, 200);
  const [amount, setAmount] = useState('');

  if (!mounted) return null;

  const value = Number(amount);
  const valid = Number.isInteger(value) && value > 0;

  const close = () => {
    setAmount('');
    onClose();
  };

  const send = () => {
    if (!valid) return;
    payContact({ number: contact.number, amount: value });
    close();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-money-title"
      onKeyDown={(event) => event.key === 'Escape' && close()}
      className={cn(
        'absolute left-5 right-5 top-[176px] z-30 flex flex-col gap-5 rounded-lg border border-cb-border bg-cb-popover p-5 shadow-[0_10px_15px_-3px_#000000,0_4px_6px_-4px_#000000] transition-[opacity,transform] duration-200 ease-cb',
        shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 id="send-money-title" className="text-base font-semibold leading-6 text-cb-foreground">
            {t('COBALT.CONTACTS.SEND_MONEY')}
          </h2>
          <p className="text-sm leading-5 text-cb-muted-foreground">
            {t('COBALT.CONTACTS.SEND_TO', { name: contact.display, number: contact.number })}
          </p>
        </div>
        <IconButton label={t('COBALT.CONTACTS.CLOSE')} onClick={close} className="h-9 w-9 rounded-md">
          <XCircle size={20} weight="fill" />
        </IconButton>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium leading-5 text-cb-foreground">{t('COBALT.CONTACTS.AMOUNT')}</span>
        <span className="flex h-12 items-center gap-1.5 rounded-md border border-cb-input bg-cb-background px-3 focus-within:border-cb-primary focus-within:shadow-[inset_0_0_0_1px_#5078D7]">
          <span className="text-2xl font-medium leading-8 text-[#737373]">$</span>
          <NPWDInput
            autoFocus
            onFocus={() => toggleKeys(false)}
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/\D/g, '').slice(0, maxAmountDigits))}
            onKeyDown={(event) => event.key === 'Enter' && send()}
            placeholder="0"
            className="h-full min-w-0 flex-1 rounded-none bg-cb-background px-0 py-0 text-2xl font-semibold leading-8 tabular-nums text-cb-foreground placeholder:text-[#737373] dark:bg-cb-background dark:text-cb-foreground"
          />
        </span>
        <span className="text-xs leading-4 text-cb-muted-foreground">{t('COBALT.CONTACTS.FROM_BANK')}</span>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={close}
          className="h-9 flex-1 rounded-md border border-cb-input bg-cb-secondary text-sm font-medium text-cb-foreground transition-colors duration-150 ease-cb hover:bg-cb-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
        >
          {t('COBALT.CONTACTS.CANCEL')}
        </button>
        <button
          type="button"
          onClick={send}
          disabled={!valid}
          className="h-9 flex-1 rounded-md bg-cb-primary text-sm font-medium tabular-nums text-cb-foreground transition-colors duration-150 ease-cb hover:bg-cb-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground disabled:bg-cb-secondary disabled:text-cb-muted-foreground"
        >
          {valid
            ? t('COBALT.CONTACTS.SEND_AMOUNT', { amount: value.toLocaleString('en-US') })
            : t('COBALT.CONTACTS.SEND')}
        </button>
      </div>
    </div>
  );
};
