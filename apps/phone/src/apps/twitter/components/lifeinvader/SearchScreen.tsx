import React, { useState } from 'react';
import { useText } from '../../hooks/useText';
import { MagnifyingGlass, XCircle } from '@phosphor-icons/react';
import { Tweet, TwitterEvents } from '@typings/twitter';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { buildRespObj } from '@utils/misc';
import { NPWDInput } from '@ui/components/Input';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useFilteredTweets } from '../../hooks/state';
import { processTweet } from '../../utils/tweets';
import { MockTweets } from '../../utils/constants';
import { Post } from './Post';
import { FeedMessage } from './FeedMessage';

const matchingMockTweets = (query: string): Tweet[] =>
  MockTweets.filter((tweet) =>
    `${tweet.profile_name} ${tweet.message}`.toLowerCase().includes(query.toLowerCase()),
  );

export const SearchScreen: React.FC = () => {
  const t = useText();
  const { addAlert } = useSnackbar();
  const [value, setValue] = useState('');
  const [searchedFor, setSearchedFor] = useState('');
  const [tweets, setResults] = useFilteredTweets();

  const search = () => {
    const query = value.trim();
    if (!query) return;

    fetchNui<ServerPromiseResp<Tweet[]>>(
      TwitterEvents.FETCH_TWEETS_FILTERED,
      { searchValue: query },
      buildRespObj(matchingMockTweets(query), 'ok'),
    ).then((resp) => {
      if (resp?.status !== 'ok') {
        return addAlert({ message: t(resp?.errorMsg || ''), type: 'error' });
      }
      setSearchedFor(query);
      setResults((resp.data ?? []).map(processTweet));
    });
  };

  const clear = () => {
    setValue('');
    setSearchedFor('');
    setResults([]);
  };

  const removeResult = (tweetId: number) =>
    setResults((current) => current.filter((tweet) => tweet.id !== tweetId));

  return (
    <div className="flex h-full flex-col">
      <form
        className="shrink-0 border-b border-[#D9D9D9] bg-white p-2.5"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          search();
        }}
      >
        <div className="flex h-10 items-center gap-2 rounded border border-[#D9D9D9] bg-[#F7F7F7] px-3 focus-within:border-[#D40604]">
          <MagnifyingGlass size={18} weight="fill" color="#6B6B6B" className="shrink-0" />
          <NPWDInput
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t('TWITTER.SEARCH_TWEETS_PLACEHOLDER')}
            aria-label={t('COBALT.LIFEINVADER.SEARCH')}
            className="h-full flex-1 bg-transparent px-0 py-0 text-[15px] leading-5 text-[#1F1F1F] placeholder:text-[#6B6B6B] dark:bg-transparent dark:text-[#1F1F1F]"
          />
          {value && (
            <button
              type="button"
              onClick={clear}
              aria-label={t('COBALT.CLEAR_SEARCH')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40604]"
            >
              <XCircle size={16} weight="fill" color="#6B6B6B" />
            </button>
          )}
        </div>
      </form>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5 pb-24">
        {searchedFor && tweets.length > 0 && (
          <p className="text-xs font-bold uppercase leading-4 tracking-[0.06em] text-[#6B6B6B]">
            {t('COBALT.LIFEINVADER.SEARCH_RESULTS', { count: tweets.length, query: searchedFor })}
          </p>
        )}
        {searchedFor && tweets.length === 0 && (
          <FeedMessage
            title={t('COBALT.LIFEINVADER.SEARCH_EMPTY')}
            caption={t('COBALT.LIFEINVADER.SEARCH_EMPTY_CAPTION')}
          />
        )}
        {tweets.map((tweet) => (
          <Post key={tweet.id} tweet={tweet} onDeleted={removeResult} />
        ))}
      </div>
    </div>
  );
};
