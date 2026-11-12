import React, { useEffect, useRef, useState } from 'react';
import { useText } from '../../hooks/useText';
import { useSetRecoilState } from 'recoil';
import { ChatCircle, DotsThree, Heart, Repeat } from '@phosphor-icons/react';
import { FormattedTweet, TwitterEvents } from '@typings/twitter';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { usePhone } from '@os/phone/hooks/usePhone';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { toggleKeys } from '@ui/components';
import { usePresence } from '@ui/cobalt';
import { twitterState } from '../../hooks/state';
import { useTwitterActions } from '../../hooks/useTwitterActions';

const MUTED = '#6B6B6B';
const BRAND = '#D40604';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  count?: number;
  active?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  count,
  active,
  className,
  ...rest
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      'flex h-8 w-16 shrink-0 items-center gap-1.5 rounded text-[13px] font-medium tabular-nums leading-4 transition-transform duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40604] active:scale-95',
      active ? 'text-[#D40604]' : 'text-[#6B6B6B]',
      className,
    )}
    {...rest}
  >
    {icon}
    {count != null && count > 0 && <span>{count}</span>}
  </button>
);

const ReplyAction: React.FC<{ profileName: string }> = ({ profileName }) => {
  const t = useText();
  const setModalVisible = useSetRecoilState(twitterState.showCreateTweetModal);
  const setMessage = useSetRecoilState(twitterState.modalMessage);

  const reply = () => {
    setMessage(`@${profileName} `);
    setModalVisible(true);
    toggleKeys(false);
  };

  return (
    <ActionButton
      label={t('COBALT.LIFEINVADER.REPLY')}
      icon={<ChatCircle size={18} weight="fill" color={MUTED} />}
      onClick={reply}
    />
  );
};

const LikeAction: React.FC<{ tweetId: number; isLiked: boolean; likes: number }> = ({
  tweetId,
  isLiked,
  likes,
}) => {
  const t = useText();
  const { addAlert } = useSnackbar();
  const { localToggleLike } = useTwitterActions();
  const [liked, setLiked] = useState(isLiked);
  const [pending, setPending] = useState(false);

  const toggle = () => {
    setPending(true);
    fetchNui<ServerPromiseResp<void>>(TwitterEvents.TOGGLE_LIKE, { tweetId }).then((resp) => {
      setPending(false);
      if (resp.status !== 'ok') {
        return addAlert({ message: t('TWITTER.FEEDBACK.LIKE_TWEET_FAILED'), type: 'error' });
      }
      setLiked((value) => !value);
      localToggleLike(tweetId);
    });
  };

  return (
    <ActionButton
      label={t('COBALT.LIFEINVADER.LIKE')}
      aria-pressed={liked}
      active={liked}
      disabled={pending}
      count={likes}
      icon={<Heart size={18} weight="fill" color={liked ? BRAND : MUTED} />}
      onClick={toggle}
    />
  );
};

const RepostAction: React.FC<{ tweet: FormattedTweet }> = ({ tweet }) => {
  const t = useText();
  const { addAlert } = useSnackbar();
  const [reposted, setReposted] = useState(false);

  const repost = () => {
    if (reposted) return;
    const tweetId = tweet.isRetweet ? tweet.retweetId : tweet.id;
    fetchNui<ServerPromiseResp<void>>(TwitterEvents.RETWEET, { tweetId }).then((resp) => {
      if (resp.status !== 'ok') {
        return addAlert({ message: t(resp.errorMsg), type: 'error' });
      }
      setReposted(true);
    });
  };

  return (
    <ActionButton
      label={t('COBALT.LIFEINVADER.REPOST')}
      aria-pressed={reposted}
      active={reposted}
      icon={<Repeat size={18} weight="fill" color={reposted ? BRAND : MUTED} />}
      onClick={repost}
    />
  );
};

interface PostMenuProps {
  tweet: FormattedTweet;
  onDeleted?: (tweetId: number) => void;
}

const PostMenu: React.FC<PostMenuProps> = ({ tweet, onDeleted }) => {
  const t = useText();
  const { ResourceConfig } = usePhone();
  const { addAlert } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(tweet.isReported);
  const rootRef = useRef<HTMLDivElement>(null);
  const { mounted, shown } = usePresence(open, 150);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!ResourceConfig) return null;

  const canDelete = ResourceConfig.twitter.allowDeleteTweets && tweet.isMine;
  const canReport = ResourceConfig.twitter.allowReportTweets && !tweet.isMine;

  const remove = () => {
    setOpen(false);
    fetchNui<ServerPromiseResp<void>>(TwitterEvents.DELETE_TWEET, { tweetId: tweet.id }).then(
      (resp) => {
        if (resp.status !== 'ok') {
          return addAlert({ message: t('TWITTER.FEEDBACK.DELETE_TWEET_FAILED'), type: 'error' });
        }
        onDeleted?.(tweet.id);
      },
    );
  };

  const report = () => {
    setOpen(false);
    if (reported) return;
    fetchNui<ServerPromiseResp<void>>(TwitterEvents.REPORT, { tweetId: tweet.id }).then((resp) => {
      if (resp.status !== 'ok') {
        return addAlert({ message: t('TWITTER.FEEDBACK.REPORT_TWEET_FAILED'), type: 'error' });
      }
      setReported(true);
      addAlert({ message: t('TWITTER.FEEDBACK.REPORT_TWEET_SUCCESS'), type: 'success' });
    });
  };

  const itemClass =
    'flex h-10 w-full items-center px-4 text-left text-sm text-[#1F1F1F] transition-colors duration-150 ease-cb hover:bg-[#EDEDED] focus-visible:bg-[#EDEDED] focus-visible:outline-none';

  return (
    <div ref={rootRef} className="relative flex w-8 shrink-0 justify-end">
      <button
        type="button"
        aria-label={t('COBALT.LIFEINVADER.MORE')}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!canDelete && !canReport}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-end rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40604] disabled:cursor-default"
      >
        <DotsThree size={18} weight="fill" color={MUTED} />
      </button>
      {mounted && (
        <div
          role="menu"
          className={cn(
            'absolute bottom-9 right-0 z-20 min-w-[140px] origin-bottom-right overflow-hidden rounded-md border border-[#D9D9D9] bg-white py-1 shadow-[0_4px_12px_#BDBDBD] transition-[opacity,transform] duration-150 ease-cb',
            shown ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          {canDelete && (
            <button type="button" role="menuitem" className={itemClass} onClick={remove}>
              {t('GENERIC.DELETE')}
            </button>
          )}
          {canReport && (
            <button
              type="button"
              role="menuitem"
              className={cn(itemClass, reported && 'text-[#6B6B6B]')}
              onClick={report}
            >
              {reported ? t('COBALT.LIFEINVADER.REPORTED') : t('TWITTER.REPORT')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface PostActionsProps {
  tweet: FormattedTweet;
  onDeleted?: (tweetId: number) => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ tweet, onDeleted }) => {
  const { ResourceConfig } = usePhone();
  const profileName = tweet.isRetweet ? tweet.retweetProfileName : tweet.profile_name;

  return (
    <div className="flex justify-between border-t border-[#D9D9D9] py-1">
      <ReplyAction profileName={profileName} />
      <LikeAction tweetId={tweet.id} isLiked={tweet.isLiked} likes={tweet.likes} />
      {ResourceConfig?.twitter.allowRetweet && !tweet.isMine ? (
        <RepostAction tweet={tweet} />
      ) : (
        <span className="w-16 shrink-0" />
      )}
      <PostMenu tweet={tweet} onDeleted={onDeleted} />
    </div>
  );
};
