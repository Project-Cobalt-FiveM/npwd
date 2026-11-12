import React from 'react';
import { useCall } from '../hooks/useCall';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { CallScreen } from './CallScreen';

export const CallModal: React.FC = () => {
  const { call } = useCall();

  if (!call) return null;

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <CallScreen call={call} />
    </React.Suspense>
  );
};
