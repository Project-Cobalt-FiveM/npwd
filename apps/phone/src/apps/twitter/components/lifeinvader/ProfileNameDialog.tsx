import React, { useState } from 'react';
import { useText } from '../../hooks/useText';
import { useRecoilValue } from 'recoil';
import { TwitterEvents, TwitterProfile } from '@typings/twitter';
import { ServerPromiseResp } from '@typings/common';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { usePhone } from '@os/phone/hooks/usePhone';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { twitterState, useSetTwitterProfile } from '../../hooks/state';
import { useProfile } from '../../hooks/useProfile';
import { LifeInvaderTagline, LifeInvaderWordmark } from './brand';
import { Dialog, DialogButton } from './Dialog';
import { Field } from './Field';

export const ProfileNameDialog: React.FC = () => {
  const t = useText();
  const { profile } = useProfile();
  const { ResourceConfig } = usePhone();
  const { addAlert } = useSnackbar();
  const setTwitterProfile = useSetTwitterProfile();
  const defaultNames: string[] | null = useRecoilValue(twitterState.defaultProfileNames);
  const [name, setName] = useState(profile?.profile_name ?? '');
  const pickFromDefaults = !ResourceConfig?.twitter.allowEditableProfileName;

  const create = () => {
    const profileName = name.trim();
    if (!profileName) return;

    fetchNui<ServerPromiseResp<TwitterProfile>>(TwitterEvents.CREATE_PROFILE, {
      profile_name: profileName,
    }).then((resp) => {
      if (resp.status !== 'ok') {
        return addAlert({ message: t('TWITTER.FEEDBACK.CREATE_PROFILE_FAILURE'), type: 'error' });
      }
      setTwitterProfile(resp.data);
    });
  };

  return (
    <Dialog open label={t('COBALT.LIFEINVADER.PICK_NAME_TITLE')}>
      <div className="flex flex-col items-center gap-2 border-b border-[#D9D9D9] pb-[18px] pt-[22px]">
        <LifeInvaderWordmark size="dialog" />
        <LifeInvaderTagline className="text-[12.5px] leading-4" />
      </div>
      <form
        className="flex flex-col gap-3.5 px-6 pb-4 pt-5"
        onSubmit={(event) => {
          event.preventDefault();
          create();
        }}
      >
        <div className="text-sm leading-5 text-[#6B6B6B]">
          <h2 className="text-xl font-extrabold leading-7 tracking-[-0.02em] text-[#1F1F1F]">
            {t('COBALT.LIFEINVADER.PICK_NAME_TITLE')}
          </h2>
          <p>{t('COBALT.LIFEINVADER.PICK_NAME_CAPTION')}</p>
        </div>
        {pickFromDefaults ? (
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={t('TWITTER.EDIT_PROFILE_NAME')}
          >
            {(defaultNames ?? []).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={option === name}
                onClick={() => setName(option)}
                className={cn(
                  'h-9 rounded-sm border px-3 text-sm font-semibold transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40604]',
                  option === name
                    ? 'border-[#D40604] bg-[#D40604] text-white'
                    : 'border-[#D9D9D9] bg-[#F7F7F7] text-[#1F1F1F]',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <Field
            label={t('TWITTER.EDIT_PROFILE_NAME')}
            value={name}
            onChange={setName}
            placeholder={t('COBALT.LIFEINVADER.NAME_EXAMPLE')}
            inputClassName="h-11 text-[15px]"
            autoFocus
          />
        )}
        <DialogButton type="submit" className="self-end" disabled={!name.trim()}>
          {t('COBALT.LIFEINVADER.CONTINUE')}
        </DialogButton>
      </form>
    </Dialog>
  );
};
