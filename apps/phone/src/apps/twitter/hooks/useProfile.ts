import { useRecoilValue } from 'recoil';
import { twitterState } from './state';

interface IProfile {
  profile_name?: string;
  avatar_url?: string;
}

interface IUseProfile {
  profile: IProfile;
}

const NO_PROFILE: IProfile = {};

export const useProfile = (): IUseProfile => {
  const profile = useRecoilValue(twitterState.profile);
  return {
    profile: profile ?? NO_PROFILE,
  };
};
