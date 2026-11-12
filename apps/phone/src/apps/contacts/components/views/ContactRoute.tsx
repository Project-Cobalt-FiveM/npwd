import React from 'react';
import { useParams } from 'react-router-dom';
import { useContactsValue } from '../../hooks/state';
import { ContactDetail } from './ContactDetail';
import { ContactForm } from './ContactForm';

const newContactId = '-1';

export const ContactRoute: React.FC<{ editing?: boolean }> = ({ editing }) => {
  const { id } = useParams<{ id: string }>();
  const contacts = useContactsValue();

  if (id === newContactId) return <ContactForm />;

  const contact = contacts.find((candidate) => String(candidate.id) === id);
  if (!contact) return null;

  return editing ? <ContactForm contact={contact} /> : <ContactDetail contact={contact} />;
};
