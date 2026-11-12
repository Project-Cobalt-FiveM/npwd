import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useText } from '@apps/contacts/hooks/useText';
import type { Icon } from '@phosphor-icons/react';
import { Microphone, MicrophoneSlash, Phone, PhoneDisconnect } from '@phosphor-icons/react';
import { Avatar } from '@ui/cobalt';
import { cn } from '@utils/css';
import { ActiveCall } from '@typings/call';
import { useContactLookup } from '@apps/contacts/hooks/useContactLookup';
import { avatarSource } from '@apps/contacts/utils/avatar';
import { useCall } from '../hooks/useCall';
import { useCallModal } from '../hooks/useCallModal';
import useTimer from '../hooks/useTimer';

type CallPhase = 'incoming' | 'outgoing' | 'ongoing';

const phaseOf = (call: ActiveCall): CallPhase => {
  if (call.is_accepted) return 'ongoing';
  return call.isTransmitter ? 'outgoing' : 'incoming';
};

const pad = (value: number) => value.toString().padStart(2, '0');

const CallTimer: React.FC = () => {
  const { hours, minutes, seconds } = useTimer();
  const clock = `${pad(minutes)}:${pad(seconds)}`;
  return <>{hours > 0 ? `${hours}:${clock}` : clock}</>;
};

interface CallButtonProps {
  label: string;
  icon: Icon;
  tone: 'accept' | 'end';
  showLabel?: boolean;
  onClick: () => void;
}

const CallButton: React.FC<CallButtonProps> = ({ label, icon: ButtonIcon, tone, showLabel, onClick }) => (
  <div className="flex flex-col items-center gap-2">
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-[72px] w-[72px] items-center justify-center rounded-full text-cb-foreground transition-transform duration-150 ease-cb active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground',
        tone === 'accept' ? 'bg-cb-success' : 'bg-cb-destructive',
      )}
    >
      <ButtonIcon size={28} weight="fill" />
    </button>
    {showLabel && <span className="text-xs font-medium leading-4 text-cb-muted-foreground">{label}</span>}
  </div>
);

export const CallScreen: React.FC<{ call: ActiveCall }> = ({ call }) => {
  const t = useText();
  const history = useHistory();
  const { setModal } = useCallModal();
  const { endCall, acceptCall, rejectCall, muteCall } = useCall();
  const findContact = useContactLookup();
  const [muted, setMuted] = useState(false);

  const phase = phaseOf(call);
  const peer = call.isTransmitter ? call.receiver : call.transmitter;
  const anonymous = !call.isTransmitter && call.isAnonymous;
  const contact = anonymous ? undefined : findContact(peer);
  const name = anonymous ? t('COBALT.DIALER.PRIVATE_NUMBER') : contact?.display ?? peer;

  const leave = () => {
    setModal(false);
    history.goBack();
  };

  const decline = () => {
    leave();
    rejectCall();
  };

  const hangUp = () => {
    leave();
    endCall();
  };

  const toggleMute = () => {
    muteCall(!muted);
    setMuted(!muted);
  };

  const MuteIcon = muted ? MicrophoneSlash : Microphone;

  return (
    <div className="flex h-full flex-col bg-cb-background font-sans text-cb-foreground">
      <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-6 pt-[72px]">
        <Avatar name={anonymous ? '?' : name} src={avatarSource(contact?.avatar)} size={96} />
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.01em]">{name}</h1>
          {contact && <p className="text-sm leading-5 tabular-nums text-cb-muted-foreground">{peer}</p>}
          <p
            className={cn(
              'pt-1 text-sm font-medium leading-5 tabular-nums',
              phase === 'ongoing' ? 'text-cb-cobalt-foreground' : 'text-cb-muted-foreground',
            )}
            aria-live="polite"
          >
            {phase === 'ongoing' ? (
              <CallTimer />
            ) : (
              t(phase === 'incoming' ? 'COBALT.DIALER.INCOMING_CALL' : 'COBALT.DIALER.CALLING')
            )}
          </p>
        </div>
      </div>
      {phase === 'incoming' ? (
        <div className="flex shrink-0 justify-center gap-24 pb-16">
          <CallButton
            label={t('COBALT.DIALER.DECLINE')}
            icon={PhoneDisconnect}
            tone="end"
            showLabel
            onClick={decline}
          />
          <CallButton
            label={t('COBALT.DIALER.ACCEPT')}
            icon={Phone}
            tone="accept"
            showLabel
            onClick={acceptCall}
          />
        </div>
      ) : (
        <div className="flex shrink-0 flex-col items-center gap-10 pb-14">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-pressed={muted}
              aria-label={t('COBALT.DIALER.MUTE')}
              onClick={toggleMute}
              disabled={phase !== 'ongoing'}
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary disabled:text-[#737373]',
                muted ? 'bg-cb-primary text-cb-foreground' : 'bg-cb-secondary text-cb-foreground hover:bg-cb-input',
              )}
            >
              <MuteIcon size={24} weight="fill" />
            </button>
            <span
              className={cn(
                'text-xs font-medium leading-4',
                muted ? 'text-cb-foreground' : 'text-cb-muted-foreground',
              )}
            >
              {t('COBALT.DIALER.MUTE')}
            </span>
          </div>
          <CallButton label={t('COBALT.DIALER.END_CALL')} icon={PhoneDisconnect} tone="end" onClick={hangUp} />
        </div>
      )}
    </div>
  );
};
