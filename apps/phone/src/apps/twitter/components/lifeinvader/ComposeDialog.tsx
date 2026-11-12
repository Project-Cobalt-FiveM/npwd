import React, { useCallback, useEffect, useState } from 'react';
import { useText } from '../../hooks/useText';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Image as ImageIcon, ImagesSquare, Smiley, X } from '@phosphor-icons/react';
import { Image, NewTweet, TwitterEvents } from '@typings/twitter';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { isImageValid } from '@common/utils/isImageValid';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { usePhone } from '@os/phone/hooks/usePhone';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useWordFilter } from '@os/wordfilter/hooks/useWordFilter';
import { NPWDInput, NPWDTextarea, toggleKeys } from '@ui/components/Input';
import { useModal } from '../../hooks/useModal';
import { useProfile } from '../../hooks/useProfile';
import { IMAGE_DELIMITER } from '../../utils/images';
import { getNewLineCount } from '../../utils/message';
import EmojiSelect from '../EmojiSelect';
import { PostAvatar } from './PostAvatar';
import { Dialog, DialogButton } from './Dialog';

interface EmojiChoice {
  native: string;
}

interface ComposePrefill {
  compose?: string;
  image?: string;
}

const toolClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDEDED] transition-colors duration-150 ease-cb hover:bg-[#E0E0E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40604] disabled:bg-[#F7F7F7]';

export const ComposeDialog: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const query = useQueryParams<ComposePrefill>();
  const { ResourceConfig } = usePhone();
  const { addAlert } = useSnackbar();
  const { clean } = useWordFilter();
  const { profile } = useProfile();
  const { message, setMessage, modalVisible, setModalVisible } = useModal();
  const [images, setImages] = useState<Image[]>([]);
  const [link, setLink] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const attach = useCallback(
    (url: string) => {
      const cleaned = url.trim();
      if (!cleaned) return;
      isImageValid(cleaned)
        .then(() => setImages((current) => [...current, { id: uuidv4(), link: cleaned }]))
        .catch(() => addAlert({ message: t('COBALT.LIFEINVADER.IMAGE_INVALID'), type: 'error' }));
    },
    [addAlert, t],
  );

  useEffect(() => {
    if (query?.compose !== '1') return;
    setModalVisible(true);
    if (query.image) attach(query.image);
    history.replace('/twitter');
  }, [attach, history, query?.compose, query?.image, setModalVisible]);

  if (!ResourceConfig) return null;
  const { characterLimit, newLineLimit, maxImages, enableImages, enableEmojis } =
    ResourceConfig.twitter;

  const cleanedMessage = clean(message.trim());
  const overCharacterLimit = cleanedMessage.length > characterLimit;
  const overNewLineLimit = getNewLineCount(message) >= newLineLimit;
  const limitError = overCharacterLimit
    ? `${t('TWITTER.TWEET_MESSAGE_CHAR_LIMIT')} (${characterLimit})`
    : overNewLineLimit
    ? `${t('TWITTER.TWEET_MESSAGE_NEW_LINE_LIMIT')} (${newLineLimit})`
    : null;
  const canPost = !limitError && (cleanedMessage.length > 0 || images.length > 0);

  const close = () => {
    setModalVisible(false);
    setMessage('');
    setImages([]);
    setLink('');
    setShowLink(false);
    setShowEmoji(false);
    toggleKeys(true);
  };

  const post = () => {
    if (!canPost) return;
    const data: NewTweet = {
      message: cleanedMessage,
      retweet: null,
      images: images.map((image) => image.link).join(IMAGE_DELIMITER),
    };
    fetchNui<ServerPromiseResp<void>>(TwitterEvents.CREATE_TWEET, data, { status: 'ok' }).then(
      (resp) => {
        if (resp.status !== 'ok') {
          addAlert({ message: t('TWITTER.FEEDBACK.CREATE_FAILED'), type: 'error' });
        }
      },
    );
    close();
  };

  const addLink = () => {
    attach(link);
    setLink('');
    setShowLink(false);
  };

  const toggleLink = () => {
    setShowEmoji(false);
    setShowLink((value) => !value);
  };

  const toggleEmoji = () => {
    setShowLink(false);
    setShowEmoji((value) => !value);
  };

  const openGallery = () => {
    close();
    history.push('/gallery');
  };

  return (
    <Dialog open={modalVisible} label={t('COBALT.LIFEINVADER.NEW_POST')} onDismiss={close}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          post();
        }}
      >
        <h2 className="px-6 pb-1 pt-6 text-[22px] font-semibold leading-7 text-[#1F1F1F]">
          {t('COBALT.LIFEINVADER.NEW_POST')}
        </h2>
        <div className="flex gap-2.5 px-6 py-4">
          <PostAvatar name={profile?.profile_name ?? ''} url={profile?.avatar_url} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <NPWDTextarea
              autoFocus
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  post();
                }
              }}
              placeholder={t('COBALT.LIFEINVADER.COMPOSE_PLACEHOLDER')}
              aria-invalid={Boolean(limitError)}
              className={cn(
                'h-[148px] resize-none rounded-sm border border-[#D9D9D9] bg-[#F7F7F7] px-3 py-2.5 text-[15px] leading-[22px] text-[#1F1F1F] placeholder:text-[#6B6B6B] focus:border-[#D40604] dark:bg-[#F7F7F7] dark:text-[#1F1F1F]',
                limitError && 'border-[#D40604]',
              )}
            />
            {limitError && <p className="text-xs font-medium text-[#D40604]">{limitError}</p>}
            {images.length > 0 && (
              <ul className="flex gap-2 overflow-x-auto">
                {images.map((image) => (
                  <li key={image.id} className="relative h-16 w-16 shrink-0">
                    <img
                      src={image.link}
                      alt=""
                      className="h-full w-full rounded-sm object-cover"
                    />
                    <button
                      type="button"
                      aria-label={t('COBALT.LIFEINVADER.REMOVE_IMAGE')}
                      onClick={() =>
                        setImages((current) => current.filter((item) => item.id !== image.id))
                      }
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1F1F1F] text-white"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showLink && (
              <div className="flex items-center gap-2">
                <NPWDInput
                  value={link}
                  autoFocus
                  inputMode="url"
                  onChange={(event) => setLink(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addLink();
                    }
                  }}
                  placeholder={t('TWITTER.IMAGE_PLACEHOLDER')}
                  aria-label={t('TWITTER.IMAGE_PLACEHOLDER')}
                  className="h-10 min-w-0 flex-1 rounded-sm border border-[#D9D9D9] bg-[#F7F7F7] px-3 py-0 text-sm text-[#1F1F1F] placeholder:text-[#6B6B6B] focus:border-[#D40604] dark:bg-[#F7F7F7] dark:text-[#1F1F1F]"
                />
                <DialogButton onClick={addLink} disabled={!link.trim()}>
                  {t('COBALT.LIFEINVADER.ATTACH')}
                </DialogButton>
              </div>
            )}
          </div>
        </div>
        {showEmoji && (
          <div className="flex justify-center px-4 pb-2">
            <EmojiSelect
              visible
              onEmojiClick={(emoji: EmojiChoice) => setMessage(message.concat(emoji.native))}
            />
          </div>
        )}
        <div className="flex items-center gap-1 pb-5 pl-5 pr-4 pt-2">
          <div className="flex flex-1 gap-1">
            {enableImages && (
              <>
                <button
                  type="button"
                  aria-label={t('COBALT.LIFEINVADER.ADD_IMAGE')}
                  aria-pressed={showLink}
                  disabled={images.length >= maxImages}
                  onClick={toggleLink}
                  className={toolClass}
                >
                  <ImageIcon size={22} weight="fill" color={showLink ? '#D40604' : '#6B6B6B'} />
                </button>
                <button
                  type="button"
                  aria-label={t('COBALT.LIFEINVADER.OPEN_GALLERY')}
                  disabled={images.length >= maxImages}
                  onClick={openGallery}
                  className={toolClass}
                >
                  <ImagesSquare size={22} weight="fill" color="#6B6B6B" />
                </button>
              </>
            )}
            {enableEmojis && (
              <button
                type="button"
                aria-label={t('COBALT.LIFEINVADER.ADD_EMOJI')}
                aria-pressed={showEmoji}
                onClick={toggleEmoji}
                className={toolClass}
              >
                <Smiley size={22} weight="fill" color={showEmoji ? '#D40604' : '#6B6B6B'} />
              </button>
            )}
          </div>
          <DialogButton tone="muted" onClick={close}>
            {t('COBALT.LIFEINVADER.CANCEL')}
          </DialogButton>
          <DialogButton type="submit" disabled={!canPost}>
            {t('COBALT.LIFEINVADER.POST')}
          </DialogButton>
        </div>
      </form>
    </Dialog>
  );
};
