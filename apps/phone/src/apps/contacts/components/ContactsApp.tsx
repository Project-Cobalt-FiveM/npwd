import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { ContactsList } from './List/ContactsList';
import { ContactRoute } from './views/ContactRoute';

export const ContactsApp: React.FC = () => (
  <div id="contact-app" className="relative flex h-full flex-col bg-cb-background font-sans text-cb-foreground">
    <React.Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/contacts" exact component={ContactsList} />
        <Route path="/contacts/:id/edit" exact render={() => <ContactRoute editing />} />
        <Route path="/contacts/:id" exact component={ContactRoute} />
      </Switch>
    </React.Suspense>
  </div>
);
