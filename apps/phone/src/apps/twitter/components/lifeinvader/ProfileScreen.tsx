import React, { useState } from 'react';
import { useText } from '../../hooks/useText';
import { PencilSimple } from '@phosphor-icons/react';
import { TwitterEvents, UpdateProfileProps } from '@typings/twitter';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { usePhone } from '@os/phone/hooks/usePhone';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { usePresence } from '@ui/cobalt';
import { useProfile } from '../../hooks/useProfile';
import { useTwitterActions } from '../../hooks/useTwitterActions';
import { useProfileTweets } from '../../hooks/useProfileTweets';
import { PostAvatar, profileHandle } from './PostAvatar';
import { Post } from './Post';
import { Field } from './Field';
import { FeedMessage } from './FeedMessage';

const CoverBand: React.FC = () => (
  <svg
    viewBox="0 0 378 92"
    preserveAspectRatio="none"
    className="block h-[92px] w-full"
    aria-hidden
  >
    <rect width="378" height="92" fill="#A80503" />
    <path d="M0 92 120 30l70 40 80-52 108 60v14Z" fill="#D40604" />
    <path d="M230 92l58-34 90 34Z" fill="#7A0402" />
  </svg>
);

interface EditProfileProps {
  initial: UpdateProfileProps;
  onClose: () => void;
}

const EditProfilePanel: React.FC<EditProfileProps> = ({ initial, onClose }) => {
  const t = useText();
  const { ResourceConfig } = usePhone();
  const { addAlert } = useSnackbar();
  const { updateLocalProfile } = useTwitterActions();
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url);
  const [name, setName] = useState(initial.profile_name);

  const save = () => {
    const data: UpdateProfileProps = { avatar_url: avatarUrl.trim(), profile_name: name.trim() };
    fetchNui<ServerPromiseResp>(TwitterEvents.UPDATE_PROFILE, data, { status: 'ok' }).then(
      (resp) => {
        if (resp.status !== 'ok') {
          return addAlert({ message: t(resp.errorMsg), type: 'error' });
        }
        updateLocalProfile(data);
        addAlert({ message: t('TWITTER.FEEDBACK.EDIT_PROFILE_SUCCESS'), type: 'success' });
        onClose();
      },
    );
  };

  return (
    <form
      className="flex flex-col gap-3 rounded-sm border border-[#D9D9D9] bg-white p-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <h2 className="text-[15px] font-extrabold leading-[18px] tracking-[-0.01em] text-[#1F1F1F]">
        {t('COBALT.LIFEINVADER.EDIT_PROFILE')}
      </h2>
      {ResourceConfig?.twitter.enableAvatars && (
        <Field
          label={t('TWITTER.EDIT_PROFILE_AVATAR')}
          value={avatarUrl}
          onChange={setAvatarUrl}
          placeholder="https://cdn.fivemesh.io/"
          inputMode="url"
        />
      )}
      <Field
        label={t('TWITTER.EDIT_PROFILE_NAME')}
        value={name}
        onChange={setName}
        readOnly={!ResourceConfig?.twitter.allowEditableProfileName}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-sm bg-[#EDEDED] px-4 text-[13px] font-semibold text-[#1F1F1F] transition-colors duration-150 ease-cb hover:bg-[#E0E0E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40604]"
        >
          {t('COBALT.LIFEINVADER.CANCEL')}
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="h-9 rounded-sm bg-[#D40604] px-4 text-[13px] font-bold text-white transition-colors duration-150 ease-cb hover:bg-[#A80503] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] disabled:bg-[#D9D9D9] disabled:text-[#6B6B6B]"
        >
          {t('COBALT.LIFEINVADER.SAVE')}
        </button>
      </div>
    </form>
  );
};

export const ProfileScreen: React.FC = () => {
  const t = useText();
  const { profile } = useProfile();
  const { tweets, total, loading, removeTweet } = useProfileTweets();
  const [editing, setEditing] = useState(false);
  const { mounted, shown } = usePresence(editing, 200);
  const name = profile.profile_name ?? '';

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-y-auto p-2.5 pb-6">
      <section className="flex shrink-0 flex-col overflow-hidden rounded-sm border border-[#D9D9D9] bg-white">
        <CoverBand />
        <div className="flex h-11 shrink-0 items-end justify-between px-3.5">
          <PostAvatar
            name={name}
            url={profile.avatar_url}
            size={80}
            className="border-4 border-white font-extrabold tracking-[-0.02em] shadow-[0_1px_3px_#BDBDBD]"
          />
          <button
            type="button"
            aria-expanded={editing}
            onClick={() => setEditing((value) => !value)}
            className="flex h-[34px] items-center gap-1.5 rounded-sm bg-[#D40604] px-3.5 text-[13px] font-bold leading-4 text-white transition-[background-color,transform] duration-150 ease-cb hover:bg-[#A80503] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] active:scale-[0.97]"
          >
            <PencilSimple size={14} weight="fill" />
            {t('COBALT.LIFEINVADER.EDIT_PROFILE')}
          </button>
        </div>
        <div className="flex items-end justify-between gap-3 px-3.5 pb-3.5 pt-2.5">
          <div className="min-w-0 text-sm leading-5 text-[#6B6B6B]">
            <p className="truncate text-[22px] font-extrabold leading-7 tracking-[-0.02em] text-[#1F1F1F]">
              {name}
            </p>
            <p className="truncate">{profileHandle(name)}</p>
          </div>
          <p className="shrink-0 text-right text-[13px] leading-5 text-[#6B6B6B]">
            <span className="text-lg font-extrabold tabular-nums text-[#1F1F1F]">{total}</span>{' '}
            {t('COBALT.LIFEINVADER.POST_COUNT', { count: total })}
          </p>
        </div>
      </section>
      {mounted && (
        <div
          className={cn(
            'shrink-0 transition-[opacity,transform] duration-200 ease-cb',
            shown ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
          )}
        >
          <EditProfilePanel
            initial={{ avatar_url: profile.avatar_url ?? '', profile_name: name }}
            onClose={() => setEditing(false)}
          />
        </div>
      )}
      <h2 className="px-0.5 pt-1.5 text-xs font-bold uppercase leading-4 tracking-[0.06em] text-[#6B6B6B]">
        {t('COBALT.LIFEINVADER.YOUR_POSTS')}
      </h2>
      {!loading && tweets.length === 0 && (
        <FeedMessage
          title={t('COBALT.LIFEINVADER.NO_POSTS')}
          caption={t('COBALT.LIFEINVADER.NO_POSTS_CAPTION')}
        />
      )}
      {tweets.map((tweet) => (
        <div key={tweet.id} className="shrink-0">
          <Post tweet={tweet} onDeleted={removeTweet} />
        </div>
      ))}
    </div>
  );
};
