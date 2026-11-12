import React, { useCallback, useRef, useState } from 'react';
import { useText } from '../../hooks/useText';
import { Components, Virtuoso } from 'react-virtuoso';
import { FormattedTweet, GetTweet, TwitterEvents } from '@typings/twitter';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { usePhone } from '@os/phone/hooks';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useTweetsState } from '../../hooks/state';
import { processTweet } from '../../utils/tweets';
import { Post } from './Post';
import { FeedMessage } from './FeedMessage';

const PAGE_COOLDOWN_MS = 350;

interface FeedContext {
  hasNextPage: boolean;
}

const FeedFooter: Components<FormattedTweet, FeedContext>['Footer'] = ({ context }) => {
  const t = useText();
  return (
    <p className="px-4 pb-24 pt-5 text-center text-xs font-medium text-[#6B6B6B]">
      {context?.hasNextPage
        ? t('COBALT.LIFEINVADER.LOADING_MORE')
        : t('COBALT.LIFEINVADER.FEED_END')}
    </p>
  );
};

const FEED_COMPONENTS: Components<FormattedTweet, FeedContext> = { Footer: FeedFooter };

export const Feed: React.FC = () => {
  const t = useText();
  const { ResourceConfig } = usePhone();
  const { addAlert } = useSnackbar();
  const pageSize = ResourceConfig?.twitter?.resultsLimit || 25;
  const [tweets, setTweets] = useTweetsState();
  const [hasNextPage, setHasNextPage] = useState(tweets.length >= pageSize);
  const page = useRef(0);
  const loading = useRef(false);

  const loadNextPage = useCallback(() => {
    if (loading.current || !hasNextPage) return;
    loading.current = true;

    const pageId = page.current + 1;
    fetchNui<ServerPromiseResp<GetTweet[]>>(TwitterEvents.FETCH_TWEETS, { pageId }).then((resp) => {
      window.setTimeout(() => (loading.current = false), PAGE_COOLDOWN_MS);
      if (resp?.status !== 'ok') {
        return addAlert({ message: t(resp?.errorMsg), type: 'error' });
      }
      const nextTweets = (resp.data ?? []).map(processTweet);
      if (nextTweets.length < pageSize) setHasNextPage(false);
      setTweets((current) => [...current, ...nextTweets]);
      page.current = pageId;
    });
  }, [addAlert, hasNextPage, pageSize, setTweets, t]);

  if (tweets.length === 0) {
    return (
      <div className="p-2.5">
        <FeedMessage
          title={t('COBALT.LIFEINVADER.FEED_EMPTY')}
          caption={t('COBALT.LIFEINVADER.FEED_EMPTY_CAPTION')}
        />
      </div>
    );
  }

  return (
    <Virtuoso
      className="h-full"
      data={tweets}
      endReached={loadNextPage}
      overscan={6}
      computeItemKey={(_, tweet) => tweet.id}
      itemContent={(_, tweet) => (
        <div className="px-2.5 pt-2.5">
          <Post tweet={tweet} />
        </div>
      )}
      context={{ hasNextPage }}
      components={FEED_COMPONENTS}
    />
  );
};
