import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Backspace, ClockCounterClockwise, Copy, DotsThreeVertical } from '@phosphor-icons/react';
import { IconButton } from '@ui/cobalt';
import { setClipboard } from '@os/phone/hooks/useClipboard';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { cn } from '@utils/css';
import { useCalculator } from '../hooks/useCalculator';
import { useCalculatorHistory } from '../hooks/useCalculatorHistory';
import {
  CalculatorAction,
  CalculatorError,
  Digit,
  Operator,
  operatorSymbols,
  plainNumber,
} from '../utils/calculator';
import { CalculatorButton, CalculatorKeyTone } from './CalculatorButton';
import { HistorySheet } from './HistorySheet';
import { MoreMenu } from './MoreMenu';

interface KeyDefinition {
  id: string;
  label: string;
  tone: CalculatorKeyTone;
  action: CalculatorAction;
  content: React.ReactNode;
}

const digitKey = (digit: Digit): KeyDefinition => ({
  id: digit,
  label: digit,
  tone: 'digit',
  action: { type: 'digit', digit },
  content: digit,
});

const operatorLabels: Record<Operator, string> = {
  add: 'COBALT.CALCULATOR.ADD',
  subtract: 'COBALT.CALCULATOR.SUBTRACT',
  multiply: 'COBALT.CALCULATOR.MULTIPLY',
  divide: 'COBALT.CALCULATOR.DIVIDE',
};

const errorLabels: Record<CalculatorError, string> = {
  divideByZero: 'COBALT.CALCULATOR.DIVIDE_BY_ZERO',
  overflow: 'COBALT.CALCULATOR.OVERFLOW',
};

const keyboardActions: Record<string, CalculatorAction> = {
  '+': { type: 'operator', operator: 'add' },
  '-': { type: 'operator', operator: 'subtract' },
  '*': { type: 'operator', operator: 'multiply' },
  '/': { type: 'operator', operator: 'divide' },
  '.': { type: 'dot' },
  ',': { type: 'dot' },
  '%': { type: 'percent' },
  '=': { type: 'equals' },
  Enter: { type: 'equals' },
  Backspace: { type: 'backspace' },
  Delete: { type: 'clear' },
};

const isDigit = (key: string): key is Digit => /^[0-9]$/.test(key);

const resultSize = (length: number): number =>
  length <= 9 ? 56 : Math.max(28, Math.floor((56 * 9) / length));

export const Calculator: React.FC = () => {
  const [t] = useTranslation();
  const { addAlert } = useSnackbar();
  const history = useCalculatorHistory();
  const { display, pendingOperator, press } = useCalculator(history.add);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const operatorKey = (operator: Operator): KeyDefinition => ({
    id: operator,
    label: t(operatorLabels[operator]),
    tone: 'operator',
    action: { type: 'operator', operator },
    content: operatorSymbols[operator],
  });

  const rows: KeyDefinition[][] = [
    [
      {
        id: 'clear',
        label: t('COBALT.CALCULATOR.CLEAR'),
        tone: 'function',
        action: { type: 'clear' },
        content: <span className="text-[22px]">AC</span>,
      },
      {
        id: 'backspace',
        label: t('COBALT.CALCULATOR.BACKSPACE'),
        tone: 'function',
        action: { type: 'backspace' },
        content: <Backspace size={26} weight="fill" />,
      },
      {
        id: 'percent',
        label: t('COBALT.CALCULATOR.PERCENT'),
        tone: 'function',
        action: { type: 'percent' },
        content: '%',
      },
      operatorKey('divide'),
    ],
    [digitKey('7'), digitKey('8'), digitKey('9'), operatorKey('multiply')],
    [digitKey('4'), digitKey('5'), digitKey('6'), operatorKey('subtract')],
    [digitKey('1'), digitKey('2'), digitKey('3'), operatorKey('add')],
    [
      {
        id: 'negate',
        label: t('COBALT.CALCULATOR.TOGGLE_SIGN'),
        tone: 'digit',
        action: { type: 'negate' },
        content: '±',
      },
      digitKey('0'),
      {
        id: 'dot',
        label: t('COBALT.CALCULATOR.DECIMAL'),
        tone: 'digit',
        action: { type: 'dot' },
        content: '.',
      },
      {
        id: 'equals',
        label: t('COBALT.CALCULATOR.EQUALS'),
        tone: 'primary',
        action: { type: 'equals' },
        content: '=',
      },
    ],
  ];

  useEffect(() => {
    if (historyOpen || menuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      const action: CalculatorAction | undefined = isDigit(event.key)
        ? { type: 'digit', digit: event.key }
        : keyboardActions[event.key];
      if (!action) return;
      event.preventDefault();
      press(action);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [press, historyOpen, menuOpen]);

  const copyResult = () => {
    if (display.value === null) return;
    setClipboard(plainNumber(display.value));
    addAlert({ message: t('COBALT.CALCULATOR.COPIED'), type: 'success' });
  };

  const result = display.error ? t(errorLabels[display.error]) : display.result;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-cb-background font-sans text-cb-foreground">
      <header className="flex h-14 shrink-0 items-center justify-end gap-1 px-2">
        <IconButton
          label={t('COBALT.CALCULATOR.HISTORY')}
          className="h-12 w-12"
          onClick={() => setHistoryOpen(true)}
        >
          <ClockCounterClockwise size={22} weight="fill" />
        </IconButton>
        <IconButton
          label={t('COBALT.CALCULATOR.MORE')}
          className="h-12 w-12"
          active={menuOpen}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <DotsThreeVertical size={22} weight="fill" />
        </IconButton>
      </header>

      <MoreMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          {
            label: t('COBALT.CALCULATOR.COPY'),
            disabled: display.value === null,
            onSelect: copyResult,
          },
          {
            label: t('COBALT.CALCULATOR.CLEAR_HISTORY'),
            disabled: history.entries.length === 0,
            onSelect: history.clear,
          },
        ]}
      />

      <section
        aria-live="polite"
        className="mx-auto flex min-h-0 w-[324px] flex-1 flex-col items-end justify-end gap-1 pb-7 tabular-nums"
      >
        <p className="min-h-7 max-w-full truncate text-xl leading-7 text-cb-muted-foreground">
          {display.expression}
        </p>
        <div className="flex w-full items-center justify-between gap-2">
          <IconButton
            label={t('COBALT.CALCULATOR.COPY')}
            className="h-9 w-9 rounded-md"
            disabled={display.value === null}
            onClick={copyResult}
          >
            <Copy size={20} weight="fill" />
          </IconButton>
          <output
            className={cn(
              'min-w-0 truncate font-semibold leading-[64px] tracking-[-0.02em]',
              display.error && 'text-[28px] font-medium text-cb-muted-foreground',
            )}
            style={display.error ? undefined : { fontSize: resultSize(result.length) }}
          >
            {result}
          </output>
        </div>
      </section>

      <div className="mx-auto flex shrink-0 flex-col gap-3 pb-7">
        {rows.map((row) => (
          <div key={row.map((key) => key.id).join()} className="flex gap-3">
            {row.map((key) => (
              <CalculatorButton
                key={key.id}
                label={key.label}
                tone={key.tone}
                selected={key.action.type === 'operator' && key.action.operator === pendingOperator}
                onPress={() => press(key.action)}
              >
                {key.content}
              </CalculatorButton>
            ))}
          </div>
        ))}
      </div>

      <HistorySheet
        open={historyOpen}
        entries={history.entries}
        onClose={() => setHistoryOpen(false)}
        onClear={history.clear}
        onSelect={(entry) => {
          press({ type: 'load', value: entry.result });
          setHistoryOpen(false);
        }}
      />
    </div>
  );
};
