import { useCallback, useMemo } from 'react';
import { Contact } from '@typings/contact';
import { useContactsValue } from './state';

const digitsOf = (number: string) => number.replace(/\D/g, '');

export const useContactLookup = (): ((number: string) => Contact | undefined) => {
  const contacts = useContactsValue();
  const { exact, byDigits } = useMemo(
    () => ({
      exact: new Map(contacts.map((contact) => [contact.number, contact])),
      byDigits: new Map(contacts.map((contact) => [digitsOf(contact.number), contact])),
    }),
    [contacts],
  );
  return useCallback(
    (number: string) => {
      const digits = digitsOf(number);
      return exact.get(number) ?? (digits ? byDigits.get(digits) : undefined);
    },
    [exact, byDigits],
  );
};
