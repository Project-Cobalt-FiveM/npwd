import React, { memo } from 'react';
import xss from 'xss';
import { useText } from '../../hooks/useText';
import { Repeat } from '@phosphor-icons/react';
import { FormattedTweet } from '@typings/twitter';
import { usePhone } from '@os/phone/hooks/usePhone';
import { PictureReveal } from '@ui/components/PictureReveal';
import { secondsToHumanReadable } from '../../utils/time';
import { PostAvatar, profileHandle } from './PostAvatar';
import { PostActions } from './PostActions';

const toSafeHtml = (message: string): string =>
  xss(message.replace(/\n\r?/g, '<br />'), { whiteList: { br: [] } });

interface PostProps {
  tweet: FormattedTweet;
  onDeleted?: (tweetId: number) => void;
}

const PostCard: React.FC<PostProps> = ({ tweet, onDeleted }) => {
  const t = useText();
  const { ResourceConfig } = usePhone();

  const authorName = tweet.isRetweet ? tweet.retweetProfileName : tweet.profile_name;
  const authorAvatar = tweet.isRetweet ? tweet.retweetAvatarUrl : tweet.avatar_url;
  const showImages = ResourceConfig?.twitter.enableImages && tweet.images.length > 0;

  return (
    <article className="flex flex-col gap-2.5 rounded border border-[#D9D9D9] bg-white px-3 pb-1 pt-3">
      {Boolean(tweet.isRetweet) && (
        <div className="flex items-center gap-1.5 text-xs font-medium leading-4 text-[#6B6B6B]">
          <Repeat size={14} weight="fill" color="#6B6B6B" />
          {t('COBALT.LIFEINVADER.REPOSTED_BY', { name: tweet.profile_name })}
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <PostAvatar name={authorName} url={authorAvatar} />
        <div className="min-w-0 text-[13px] leading-[18px] text-[#6B6B6B]">
          <p className="truncate text-[15px] font-bold text-[#1F1F1F]">{authorName}</p>
          <p className="truncate">
            {profileHandle(authorName)} · {secondsToHumanReadable(t, tweet.seconds_since_tweet)}
          </p>
        </div>
      </div>
      {tweet.message && (
        <p
          className="break-words text-sm leading-5 text-[#1F1F1F]"
          dangerouslySetInnerHTML={{ __html: toSafeHtml(tweet.message) }}
        />
      )}
      {showImages && (
        <div className="flex flex-col gap-1.5">
          {tweet.images.map((image) => (
            <PictureReveal key={image.id}>
              <img
                src={image.link}
                alt=""
                className="h-[150px] w-full rounded-sm bg-[#EDEDED] object-cover"
              />
            </PictureReveal>
          ))}
        </div>
      )}
      <PostActions tweet={tweet} onDeleted={onDeleted} />
    </article>
  );
};

export const Post = memo(PostCard);
