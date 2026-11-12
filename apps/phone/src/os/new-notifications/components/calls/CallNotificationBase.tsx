import { SnackbarContent, CustomContentProps } from 'notistack';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Phone, PhoneDisconnect } from '@phosphor-icons/react';
import { useCurrentCallValue } from '@os/call/hooks/state';
import { useCall } from '@os/call/hooks/useCall';
import useTimer from '@os/call/hooks/useTimer';
import { useContactActions } from '@apps/contacts/hooks/useContactActions';
import { Avatar } from '@ui/cobalt';

interface CallNotificationBaseProps extends CustomContentProps {
  title: string;
  transmitter: string;
  receiver: string;
}

export type CallNotificationBaseComponent = React.FC<CallNotificationBaseProps>;

const formatTime = (time: number) => (time < 10 ? `0${time}` : `${time}`);

const pillButton =
  'flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-cb-foreground transition-colors duration-150 ease-cb';

export const CallNotificationBase = forwardRef<HTMLDivElement, CallNotificationBaseProps>(
  (props, ref) => {
    const { endCall, acceptCall, rejectCall } = useCall();
    const { transmitter, receiver } = props;
    const call = useCurrentCallValue();
    const { minutes, seconds, startTimer, resetTimer } = useTimer();
    const { getPictureByNumber, getDisplayByNumber } = useContactActions();
    const { t } = useTranslation();
    const { pathname } = useLocation();

    if (!call || pathname === '/call') return <div ref={ref} hidden />;

    const incoming = !call.isTransmitter && !call.is_accepted;
    const otherNumber = call.isTransmitter ? call.receiver : call.transmitter;
    const name = call.isTransmitter ? receiver : transmitter;
    const displayName = getDisplayByNumber(otherNumber) ?? name;

    const handleAccept = () => {
      acceptCall();
      resetTimer();
      startTimer();
    };

    const handleEndOrReject = () => {
      if (incoming) rejectCall();
      else endCall();
      resetTimer();
    };

    const subtitle: string = call.is_accepted
      ? `${formatTime(minutes)}:${formatTime(seconds)}`
      : `${incoming ? t('COBALT.INCOMING_CALL') : t('COBALT.CALLING')} · ${otherNumber}`;
    const declineLabel: string = incoming ? t('COBALT.DECLINE') : t('COBALT.HANG_UP');
    const answerLabel: string = t('COBALT.ANSWER');

    return (
      <SnackbarContent
        ref={ref}
        role="alert"
        className="flex w-[384px] flex-col gap-4 rounded-3xl bg-cb-muted p-4 text-cb-foreground shadow-[0_10px_15px_-3px_#000000]"
      >
        <div className="flex w-full items-center gap-3">
          <Avatar name={displayName} src={getPictureByNumber(otherNumber)} size={48} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-base font-semibold">{displayName}</span>
            <span className="truncate text-sm text-cb-muted-foreground tabular-nums">{subtitle}</span>
          </div>
        </div>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={handleEndOrReject}
            className={`${pillButton} bg-cb-destructive hover:bg-[#B91C1C]`}
          >
            <PhoneDisconnect size={18} weight="fill" />
            {declineLabel}
          </button>
          {incoming && (
            <button
              type="button"
              onClick={handleAccept}
              className={`${pillButton} bg-cb-success hover:bg-[#15803D]`}
            >
              <Phone size={18} weight="fill" />
              {answerLabel}
            </button>
          )}
        </div>
      </SnackbarContent>
    );
  },
);
