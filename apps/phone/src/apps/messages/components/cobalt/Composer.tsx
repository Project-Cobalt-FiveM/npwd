import React, { useRef, useState } from 'react';
import { Microphone, PaperPlaneRight, PlusCircle, XCircle } from '@phosphor-icons/react';
import { MessageConversation } from '@typings/messages';
import { IconButton } from '@ui/cobalt';
import { cn } from '@utils/css';
import { useWordFilter } from '@os/wordfilter/hooks/useWordFilter';
import { useMessageAPI } from '../../hooks/useMessageAPI';
import { gameFocusProps } from '../../utils/gameFocus';
import { useText } from '../../hooks/useText';

const maxInputHeight = 120;

interface ComposerProps {
  conversation: MessageConversation;
  attachment: string | null;
  onClearAttachment: () => void;
  onAttach: () => void;
  voiceEnabled: boolean;
  onVoice: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  conversation,
  attachment,
  onClearAttachment,
  onAttach,
  voiceEnabled,
  onVoice,
}) => {
  const t = useText();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useMessageAPI();
  const { clean } = useWordFilter();

  const target = {
    conversationId: conversation.id,
    conversationList: conversation.conversationList,
    tgtPhoneNumber: conversation.participant,
  };

  const canSend = Boolean(attachment) || text.trim().length > 0;
  const showVoice = voiceEnabled && !canSend;

  const resize = () => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, maxInputHeight)}px`;
  };

  const send = () => {
    if (!canSend) return;
    if (attachment) {
      sendMessage({ ...target, message: attachment });
      onClearAttachment();
    }
    if (text.trim()) sendMessage({ ...target, message: clean(text) });
    setText('');
    requestAnimationFrame(resize);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    send();
  };

  return (
    <div className="flex shrink-0 flex-col gap-2 bg-cb-background pb-2.5 pl-1 pr-2 pt-2">
      {attachment && (
        <div className="relative ml-12 w-fit">
          <img
            src={attachment}
            alt=""
            className="block h-24 max-w-[200px] rounded-2xl object-cover"
          />
          <button
            type="button"
            aria-label={t('COBALT.MESSAGES.REMOVE_ATTACHMENT')}
            onClick={onClearAttachment}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-cb-background bg-cb-input text-cb-foreground"
          >
            <XCircle size={16} weight="fill" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <IconButton label={t('COBALT.MESSAGES.ATTACH')} onClick={onAttach} className="h-11 w-11">
          <PlusCircle size={26} weight="fill" />
        </IconButton>
        <div className="flex min-h-[44px] flex-1 items-center rounded-[22px] border border-cb-input bg-cb-muted px-[18px] py-2.5">
          <textarea
            {...gameFocusProps}
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(event) => {
              setText(event.currentTarget.value);
              resize();
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('COBALT.MESSAGES.TEXT_MESSAGE')}
            aria-label={t('COBALT.MESSAGES.TEXT_MESSAGE')}
            className="block max-h-[120px] w-full resize-none bg-transparent text-sm leading-5 text-cb-foreground placeholder:text-[#737373] focus:outline-none"
          />
        </div>
        <button
          type="button"
          aria-label={showVoice ? t('COBALT.MESSAGES.VOICE_MESSAGE') : t('COBALT.MESSAGES.SEND')}
          onClick={showVoice ? onVoice : send}
          disabled={!showVoice && !canSend}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-foreground active:scale-95',
            canSend || showVoice
              ? 'bg-cb-primary text-cb-foreground hover:bg-cb-primary-hover'
              : 'bg-cb-secondary text-[#737373]',
          )}
        >
          {showVoice ? (
            <Microphone size={20} weight="fill" />
          ) : (
            <PaperPlaneRight size={20} weight="fill" />
          )}
        </button>
      </div>
    </div>
  );
};
