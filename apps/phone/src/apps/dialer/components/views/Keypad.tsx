import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useText } from '@apps/contacts/hooks/useText';
import { Backspace, Phone } from '@phosphor-icons/react';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { useCall } from '@os/call/hooks/useCall';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useContactLookup } from '@apps/contacts/hooks/useContactLookup';
import { cn } from '@utils/css';
import { useDialHistory } from '../../hooks/useDialHistory';

interface DialKey {
  digit: string;
  letters: string;
  hold?: string;
}

const keyRows: ReadonlyArray<ReadonlyArray<DialKey>> = [
  [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
  ],
  [
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
  ],
  [
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
  ],
  [
    { digit: '*', letters: '' },
    { digit: '0', letters: '+', hold: '+' },
    { digit: '#', letters: '' },
  ],
];

const holdMs = 500;
const maxDigits = 20;

const useHold = (onTap: () => void, onHold: (() => void) | undefined) => {
  const timer = useRef<number>();
  const held = useRef(true);

  const start = () => {
    held.current = false;
    if (!onHold) return;
    timer.current = window.setTimeout(() => {
      held.current = true;
      onHold();
    }, holdMs);
  };

  const end = () => {
    window.clearTimeout(timer.current);
    if (!held.current) onTap();
    held.current = true;
  };

  const cancel = () => {
    window.clearTimeout(timer.current);
    held.current = true;
  };

  const keyboardPress = (event: React.MouseEvent) => {
    if (event.detail === 0) onTap();
  };

  return { onPointerDown: start, onPointerUp: end, onPointerLeave: cancel, onClick: keyboardPress };
};

const KeypadKey: React.FC<{ dialKey: DialKey; onPress: (value: string) => void }> = ({
  dialKey,
  onPress,
}) => {
  const { digit, letters, hold } = dialKey;
  const handlers = useHold(
    () => onPress(digit),
    hold ? () => onPress(hold) : undefined,
  );

  return (
    <button
      type="button"
      aria-label={digit}
      className="flex h-16 w-24 shrink-0 select-none flex-col items-center justify-center rounded-full transition-colors duration-150 ease-cb active:bg-cb-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
      {...handlers}
    >
      <span className="text-[28px] leading-8 text-cb-foreground">{digit}</span>
      <span className="h-3 text-[10px] font-medium leading-3 tracking-[0.12em] text-cb-muted-foreground">
        {letters}
      </span>
    </button>
  );
};

export const Keypad: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const query = useQueryParams<{ number?: string }>();
  const [digits, setDigits] = useState(query.number ?? '');
  const { initializeCall } = useCall();
  const myNumber = useMyPhoneNumber();
  const calls = useDialHistory();
  const findContact = useContactLookup();

  const contact = digits ? findContact(digits) : undefined;
  const lastDialed = calls.find((call) => call.transmitter === myNumber)?.receiver;

  const press = (value: string) =>
    setDigits((current) => (current.length >= maxDigits ? current : current + value));

  const backspace = useHold(
    () => setDigits((current) => current.slice(0, -1)),
    () => setDigits(''),
  );

  const call = () => {
    if (digits) {
      initializeCall(digits);
      return;
    }
    if (lastDialed) setDigits(lastDialed);
  };

  const addContact = () =>
    history.push(`/contacts/-1?addNumber=${encodeURIComponent(digits)}&referal=/phone/contacts`);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-end gap-1.5 px-6 pb-6">
        <p
          className={cn(
            'w-full truncate text-center font-medium tabular-nums tracking-[-0.01em] text-cb-foreground',
            digits.length > 12 ? 'text-[28px] leading-10' : 'text-[34px] leading-10',
          )}
          aria-live="polite"
        >
          {digits || ' '}
        </p>
        <div className="h-5">
          {contact ? (
            <p className="text-sm font-medium leading-5 text-cb-muted-foreground">{contact.display}</p>
          ) : (
            digits && (
              <button
                type="button"
                onClick={addContact}
                className="rounded text-sm font-medium leading-5 text-cb-cobalt-foreground hover:text-cb-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
              >
                {t('COBALT.DIALER.ADD_TO_CONTACTS')}
              </button>
            )
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2 pb-5">
        {keyRows.map((row) => (
          <div key={row[0].digit} className="flex gap-3">
            {row.map((dialKey) => (
              <KeypadKey key={dialKey.digit} dialKey={dialKey} onPress={press} />
            ))}
          </div>
        ))}
        <div className="flex items-center gap-3 pt-4">
          <div className="h-[72px] w-24 shrink-0" />
          <button
            type="button"
            aria-label={t('COBALT.DIALER.CALL')}
            title={t('COBALT.DIALER.CALL')}
            onClick={call}
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-cb-success text-cb-foreground transition-transform duration-150 ease-cb active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground"
          >
            <Phone size={28} weight="fill" />
          </button>
          <div className="flex h-[72px] w-24 shrink-0 items-center justify-center">
            {digits && (
              <button
                type="button"
                aria-label={t('COBALT.DIALER.BACKSPACE')}
                title={t('COBALT.DIALER.BACKSPACE')}
                className="flex h-12 w-12 items-center justify-center rounded-full text-cb-muted-foreground transition-colors duration-150 ease-cb hover:text-cb-foreground active:bg-cb-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary"
                {...backspace}
              >
                <Backspace size={24} weight="fill" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
