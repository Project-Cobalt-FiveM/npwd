import { useCallback, useEffect, useMemo, useState } from 'react';
import { useText } from './useText';
import { FormattedTweet, ProfileTweets, TwitterEvents } from '@typings/twitter';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { buildRespObj } from '@utils/misc';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { MockTweets } from '../utils/constants';
import { processTweet } from '../utils/tweets';
import { useTweetsValue } from './state';

const mockProfileTweets = (): ProfileTweets => {
  const tweets = MockTweets.filter((tweet) => tweet.isMine);
  return { tweets, total: tweets.length };
};

interface ProfilePosts {
  tweets: FormattedTweet[];
  total: number;
  loading: boolean;
}

export const useProfileTweets = (): ProfilePosts & { removeTweet: (tweetId: number) => void } => {
  const t = useText();
  const { addAlert } = useSnackbar();
  const feed = useTweetsValue();
  const [posts, setPosts] = useState<ProfilePosts>({ tweets: [], total: 0, loading: true });

  useEffect(() => {
    let active = true;
    fetchNui<ServerPromiseResp<ProfileTweets>>(
      TwitterEvents.FETCH_PROFILE_TWEETS,
      undefined,
      buildRespObj(mockProfileTweets(), 'ok'),
    ).then((resp) => {
      if (!active) return;
      if (resp?.status !== 'ok') {
        setPosts((current) => ({ ...current, loading: false }));
        return addAlert({ message: t(resp?.errorMsg), type: 'error' });
      }
      const profileTweets = resp.data?.tweets ?? [];
      setPosts({
        tweets: profileTweets.map(processTweet),
        total: resp.data?.total ?? profileTweets.length,
        loading: false,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const tweets = useMemo(
    () => posts.tweets.map((tweet) => feed.find((fresh) => fresh.id === tweet.id) ?? tweet),
    [feed, posts.tweets],
  );

  const removeTweet = useCallback((tweetId: number) => {
    setPosts((current) => ({
      ...current,
      tweets: current.tweets.filter((tweet) => tweet.id !== tweetId),
      total: Math.max(0, current.total - 1),
    }));
  }, []);

  return { tweets, total: posts.total, loading: posts.loading, removeTweet };
};
