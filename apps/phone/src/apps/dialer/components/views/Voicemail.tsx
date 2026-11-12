import React from 'react';
import { useHistory } from 'react-router-dom';
import { useText } from '@apps/contacts/hooks/useText';
import { Voicemail as VoicemailIcon } from '@phosphor-icons/react';
import { AppBar, EmptyState } from '@ui/cobalt';

export const Voicemail: React.FC = () => {
  const t = useText();
  const history = useHistory();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppBar
        className="pl-5"
        title={<span className="font-semibold">{t('COBALT.DIALER.VOICEMAIL')}</span>}
      />
      <EmptyState
        icon={<VoicemailIcon size={20} weight="fill" />}
        title={t('COBALT.DIALER.NO_VOICEMAIL')}
        caption={t('COBALT.DIALER.NO_VOICEMAIL_CAPTION')}
        action={{ label: t('COBALT.DIALER.OPEN_KEYPAD'), onClick: () => history.push('/phone/dial') }}
        className="flex-1 justify-center px-10 pb-12"
      />
    </div>
  );
};
