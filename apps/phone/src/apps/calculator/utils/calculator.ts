export type Operator = 'add' | 'subtract' | 'multiply' | 'divide';

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type CalculatorError = 'divideByZero' | 'overflow';

export interface Entry {
  digits: string;
  negative: boolean;
  percent: boolean;
}

interface Pending {
  left: number;
  operator: Operator;
}

interface Repeat {
  operator: Operator;
  operand: number;
}

export type CalculatorState =
  | {
      kind: 'ready';
      pending: Pending | null;
      entry: Entry;
      expression: string | null;
      fresh: boolean;
      repeat: Repeat | null;
    }
  | { kind: 'error'; error: CalculatorError };

type ReadyState = Extract<CalculatorState, { kind: 'ready' }>;

export type CalculatorAction =
  | { type: 'digit'; digit: Digit }
  | { type: 'dot' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'percent' }
  | { type: 'negate' }
  | { type: 'backspace' }
  | { type: 'clear' }
  | { type: 'load'; value: number };

export interface Evaluation {
  expression: string;
  result: number;
}

export const operatorSymbols: Record<Operator, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

const maxDigits = 15;
const maximumFractionDigits = 10;
const overflowLimit = 1e15;

const emptyEntry: Entry = { digits: '', negative: false, percent: false };

const initialReady: ReadyState = {
  kind: 'ready',
  pending: null,
  entry: emptyEntry,
  expression: null,
  fresh: false,
  repeat: null,
};

export const initialState: CalculatorState = initialReady;

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits });
const plainFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits, useGrouping: false });

export const formatNumber = (value: number): string => numberFormat.format(value).replace('-', '−');

export const plainNumber = (value: number): string => plainFormat.format(value);

export const formatEntry = (entry: Entry): string => {
  const [whole, fraction] = entry.digits.split('.');
  const grouped = whole ? numberFormat.format(Number(whole)) : '';
  const body = fraction === undefined ? grouped : `${grouped || '0'}.${fraction}`;
  return `${entry.negative ? '−' : ''}${body}${entry.percent ? '%' : ''}`;
};

const isEmpty = (entry: Entry): boolean => entry.digits === '';

const entryValue = (entry: Entry): number =>
  Number(entry.digits || '0') * (entry.negative ? -1 : 1);

const operandValue = (entry: Entry, pending: Pending | null): number => {
  const value = entryValue(entry);
  if (!entry.percent) return value;
  const relative = pending && (pending.operator === 'add' || pending.operator === 'subtract');
  return relative ? (pending.left * value) / 100 : value / 100;
};

const operations: Record<Operator, (left: number, right: number) => number> = {
  add: (left, right) => left + right,
  subtract: (left, right) => left - right,
  multiply: (left, right) => left * right,
  divide: (left, right) => left / right,
};

const apply = (left: number, operator: Operator, right: number): number | CalculatorError => {
  if (operator === 'divide' && right === 0) return 'divideByZero';

  const rounded = Number(operations[operator](left, right).toPrecision(15));
  return Math.abs(rounded) >= overflowLimit || !Number.isFinite(rounded) ? 'overflow' : rounded;
};

const toEntry = (value: number): Entry => ({
  digits: plainNumber(Math.abs(value)),
  negative: value < 0,
  percent: false,
});

const fail = (error: CalculatorError): CalculatorState => ({ kind: 'error', error });

const showResult = (
  expression: string,
  result: number,
  repeat: Repeat | null,
): CalculatorState => ({
  kind: 'ready',
  pending: null,
  entry: toEntry(result),
  expression,
  fresh: true,
  repeat,
});

const pendingExpression = (pending: Pending, right: string): string =>
  `${formatNumber(pending.left)} ${operatorSymbols[pending.operator]} ${right}`.trimEnd();

const editable = (state: CalculatorState): ReadyState =>
  state.kind === 'error' || state.fresh ? initialReady : state;

const countDigits = (digits: string): number => digits.replace('.', '').length;

const typeDigit = (state: CalculatorState, digit: Digit): CalculatorState => {
  const base = editable(state);
  const { digits, percent } = base.entry;
  if (percent || countDigits(digits) >= maxDigits) return base;
  const next = digits === '0' ? digit : digits + digit;
  return { ...base, entry: { ...base.entry, digits: next } };
};

const typeDot = (state: CalculatorState): CalculatorState => {
  const base = editable(state);
  const { digits, percent } = base.entry;
  if (percent || digits.includes('.')) return base;
  return { ...base, entry: { ...base.entry, digits: `${digits || '0'}.` } };
};

const chooseOperator = (state: ReadyState, operator: Operator): CalculatorState => {
  const { pending, entry } = state;
  if (pending && isEmpty(entry)) return { ...state, pending: { ...pending, operator } };
  const left = pending
    ? apply(pending.left, pending.operator, operandValue(entry, pending))
    : operandValue(entry, null);
  if (typeof left === 'string') return fail(left);
  return { ...initialReady, pending: { left, operator } };
};

const evaluate = (state: ReadyState): CalculatorState => {
  const { pending, entry, fresh, repeat } = state;
  if (pending) {
    if (isEmpty(entry)) return state;
    const operand = operandValue(entry, pending);
    const result = apply(pending.left, pending.operator, operand);
    if (typeof result === 'string') return fail(result);
    return showResult(pendingExpression(pending, formatEntry(entry)), result, {
      operator: pending.operator,
      operand,
    });
  }
  if (entry.percent) {
    return showResult(formatEntry(entry), operandValue(entry, null), null);
  }
  if (fresh && repeat) {
    const left = entryValue(entry);
    const result = apply(left, repeat.operator, repeat.operand);
    if (typeof result === 'string') return fail(result);
    return showResult(
      pendingExpression({ left, operator: repeat.operator }, formatNumber(repeat.operand)),
      result,
      repeat,
    );
  }
  return state;
};

const backspace = (state: ReadyState): CalculatorState => {
  const { pending, entry, fresh } = state;
  if (fresh) return initialState;
  if (entry.percent) return { ...state, entry: { ...entry, percent: false } };
  if (!isEmpty(entry)) {
    const digits = entry.digits.slice(0, -1);
    return {
      ...state,
      entry: { ...entry, digits, negative: digits === '' ? false : entry.negative },
    };
  }
  if (entry.negative) return { ...state, entry: emptyEntry };
  if (pending) return { ...state, pending: null, entry: toEntry(pending.left) };
  return state;
};

export const calculatorReducer = (
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState => {
  switch (action.type) {
    case 'clear':
      return initialState;
    case 'digit':
      return typeDigit(state, action.digit);
    case 'dot':
      return typeDot(state);
    default:
      break;
  }

  if (state.kind === 'error') return action.type === 'backspace' ? initialState : state;

  switch (action.type) {
    case 'operator':
      return chooseOperator(state, action.operator);
    case 'equals':
      return evaluate(state);
    case 'percent':
      return isEmpty(state.entry) || state.entry.percent
        ? state
        : { ...state, fresh: false, expression: null, entry: { ...state.entry, percent: true } };
    case 'negate':
      return {
        ...state,
        fresh: false,
        expression: null,
        entry: { ...state.entry, negative: !state.entry.negative },
      };
    case 'backspace':
      return backspace(state);
    case 'load':
      return state.pending
        ? { ...state, entry: toEntry(action.value) }
        : { ...initialReady, entry: toEntry(action.value), fresh: true };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
};

export const evaluationOf = (state: CalculatorState): Evaluation | null =>
  state.kind === 'ready' && state.fresh && state.expression !== null
    ? { expression: state.expression, result: entryValue(state.entry) }
    : null;

export interface CalculatorDisplay {
  expression: string;
  result: string;
  value: number | null;
  error: CalculatorError | null;
}

export const displayOf = (state: CalculatorState): CalculatorDisplay => {
  if (state.kind === 'error')
    return { expression: '', result: '', value: null, error: state.error };
  const { pending, entry, expression } = state;
  if (!pending) {
    const result = isEmpty(entry) ? (entry.negative ? '−' : '0') : formatEntry(entry);
    return { expression: expression ?? '', result, value: operandValue(entry, null), error: null };
  }
  const shown = pendingExpression(pending, formatEntry(entry));
  if (isEmpty(entry))
    return {
      expression: shown,
      result: formatNumber(pending.left),
      value: pending.left,
      error: null,
    };
  const preview = apply(pending.left, pending.operator, operandValue(entry, pending));
  return typeof preview === 'string'
    ? { expression: shown, result: '', value: null, error: null }
    : { expression: shown, result: formatNumber(preview), value: preview, error: null };
};
