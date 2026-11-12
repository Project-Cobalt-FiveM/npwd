import { Suspense } from 'react';
import TwitterApp from './TwitterApp';
import { LifeInvaderSplash } from './lifeinvader/brand';

const LifeInvaderContainer = () => {
  return (
    <Suspense fallback={<LifeInvaderSplash />}>
      <TwitterApp />
    </Suspense>
  );
};

export default LifeInvaderContainer;