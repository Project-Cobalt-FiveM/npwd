import { toggleKeys } from '@ui/components/Input';

export const gameFocusProps = {
  onFocus: () => toggleKeys(false),
  onBlur: () => toggleKeys(true),
} as const;
