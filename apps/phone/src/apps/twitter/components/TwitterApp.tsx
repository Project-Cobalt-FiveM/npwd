import { memo } from 'react';
import { Route, useLocation } from 'react-router-dom';
import { useText } from '../hooks/useText';
import { PencilSimple } from '@phosphor-icons/react';
import { AppWrapper } from '@ui/components';
import { Fab } from '@ui/cobalt';
import 'emoji-mart/css/emoji-mart.css';
import { useSetRecoilState } from 'recoil';
import { WordFilterProvider } from '@os/wordfilter/providers/WordFilterProvider';
import InjectDebugData from '@os/debug/InjectDebugData';
import { TwitterEvents } from '@typings/twitter';
import { useProfile } from '../hooks/useProfile';
import { TwitterThemeProvider } from '../providers/TwitterThemeProvider';
import { twitterState } from '../hooks/state';
import { LifeInvaderWordmark } from './lifeinvader/brand';
import { Feed } from './lifeinvader/Feed';
import { SearchScreen } from './lifeinvader/SearchScreen';
import { ProfileScreen } from './lifeinvader/ProfileScreen';
import { ComposeDialog } from './lifeinvader/ComposeDialog';
import { ProfileNameDialog } from './lifeinvader/ProfileNameDialog';
import { Tabs } from './lifeinvader/Tabs';

const TwitterApp = () => {
  const t = useText();
  const setComposeOpen = useSetRecoilState(twitterState.showCreateTweetModal);
  const { profile } = useProfile();
  const { pathname } = useLocation();

  const needsProfileName = !profile?.profile_name?.trim();
  const onFeed = pathname.replace(/\/$/, '') === '/twitter';

  return (
    <TwitterThemeProvider>
      <AppWrapper id="twitter-app">
        <div className="flex h-full w-full flex-col bg-[#EDEDED] font-sans">
          <header className="flex h-14 shrink-0 items-center border-b-2 border-[#7A0402] bg-[#A80503] pl-2.5 pr-3.5">
            <LifeInvaderWordmark />
          </header>
          <main className="relative min-h-0 flex-1">
            <Route path="/twitter" exact component={Feed} />
            <Route path="/twitter/search" component={SearchScreen} />
            <Route path="/twitter/profile" component={ProfileScreen} />
            {onFeed && !needsProfileName && (
              <Fab
                label={t('COBALT.LIFEINVADER.NEW_POST')}
                icon={<PencilSimple size={24} weight="fill" />}
                onClick={() => setComposeOpen(true)}
                className="bottom-3.5 right-3.5 bg-[#D40604] text-white shadow-[0_3px_6px_#A8A8A8] hover:bg-[#A80503] focus-visible:ring-[#1F1F1F]"
              />
            )}
            {needsProfileName ? (
              <ProfileNameDialog />
            ) : (
              <WordFilterProvider>
                <ComposeDialog />
              </WordFilterProvider>
            )}
          </main>
          <Tabs />
        </div>
      </AppWrapper>
    </TwitterThemeProvider>
  );
};
export default memo(TwitterApp);

InjectDebugData<any>(
  [
    {
      app: 'TWITTER',
      method: TwitterEvents.CREATE_TWEET_BROADCAST,
      data: {
        appId: 'TWITTER',
        profile_id: 423443442,
        profile_name: 'Chip',
        isMine: false,
        isLiked: false,
        retweetId: '',
        isRetweet: false,
        seconds_since_tweet: 1639,
        retweetProfileName: '',
        retweetAvatarUrl: '',
        isReported: false,
        retweetIdentifier: '',
        avatar_url: '',
        id: 116,
        message:
          'Go is better! Here is why: Go is a statically typed, compiled language in the tradition of C, with memory safety, garbage collection, structural typing, and CSP-style concurrency. The compiler, tools, and source code are all free and open source.',
        createdAt: '2021-12-01 00:42:03',
        updatedAt: '2021-12-01 00:42:03',
        identifier: '',
        retweet: null,
      },
    },
  ],
  4000,
);
