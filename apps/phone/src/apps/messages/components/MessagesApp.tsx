import React from 'react';
import {AppWrapper} from '@ui/components';
import {Route, Switch} from 'react-router-dom';
import {MessagesThemeProvider} from '../providers/MessagesThemeProvider';
import {WordFilterProvider} from '@os/wordfilter/providers/WordFilterProvider';
import {ConversationsScreen} from './cobalt/ConversationsScreen';
import {ThreadScreen} from './cobalt/ThreadScreen';
import {NewConversationScreen} from './cobalt/NewConversationScreen';

const Blank = () => <div className="flex-1 bg-cb-background"/>;

export const MessagesApp = () => (
    <MessagesThemeProvider>
        <AppWrapper id="messages-app">
            <WordFilterProvider>
                <React.Suspense fallback={<Blank/>}>
                    <Switch>
                        <Route path="/messages/conversations/:groupId">
                            <ThreadScreen/>
                        </Route>
                        <Route exact path={['/messages/new/:phoneNumber', '/messages/new']}>
                            <NewConversationScreen/>
                        </Route>
                        <Route exact path="/messages/archived">
                            <ConversationsScreen archived/>
                        </Route>
                        <Route exact path="/messages">
                            <ConversationsScreen/>
                        </Route>
                    </Switch>
                </React.Suspense>
            </WordFilterProvider>
        </AppWrapper>
    </MessagesThemeProvider>
);
