import React, { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { GalleryHome } from './GalleryHome';
import { PhotoViewer } from './PhotoViewer';

export const GalleryApp: React.FC = () => (
  <div className="flex h-full flex-col bg-cb-background font-sans text-cb-foreground">
    <Suspense fallback={<div className="flex-1 bg-cb-background" />}>
      <Switch>
        <Route path="/gallery/:photoId" component={PhotoViewer} />
        <Route path="/gallery" component={GalleryHome} />
      </Switch>
    </Suspense>
  </div>
);
