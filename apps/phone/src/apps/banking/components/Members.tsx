import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BankingMember, BankingMemberList, BankingRole } from '@typings/banking';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useText } from '@apps/gallery/hooks/useText';
import posterAdvisor from '../assets/poster-advisor.jpg';
import { bankingApi } from '../hooks/bankingApi';
import { useAccount } from '../hooks/state';
import {
  AdStrip,
  failureKey,
  FleecaButton,
  FleecaPage,
  rowClass,
  RowEnd,
  ScreenTitle,
  SiteHeader,
  TextLink,
} from './parts';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; list: BankingMemberList };

const jointRoleKey: Record<BankingRole, string> = {
  owner: 'COBALT.BANKING.ROLE_OWNER',
  admin: 'COBALT.BANKING.ROLE_ADMIN',
  member: 'COBALT.BANKING.ROLE_MEMBER',
  viewer: 'COBALT.BANKING.ROLE_VIEWER',
};

const businessRoleKey: Record<BankingRole, string> = {
  owner: 'COBALT.BANKING.ROLE_BOSS',
  admin: 'COBALT.BANKING.ROLE_TRANSFER',
  member: 'COBALT.BANKING.ROLE_TRANSFER',
  viewer: 'COBALT.BANKING.ROLE_VIEWER',
};

export const Members: React.FC = () => {
  const { accountId: rawId } = useParams<{ accountId: string }>();
  const accountId = decodeURIComponent(rawId);
  const account = useAccount(accountId);
  const text = useText();
  const { addAlert } = useSnackbar();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [citizenid, setCitizenid] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    bankingApi.members(accountId).then((result) => {
      if (active)
        setState('data' in result ? { status: 'ready', list: result.data } : { status: 'error' });
    });
    return () => {
      active = false;
    };
  }, [accountId]);

  const list = 'list' in state ? state.list : null;
  const business = list?.type === 'society';
  const accountName = account?.name ?? '';
  const title = business
    ? text('COBALT.BANKING.ORG_MEMBERS', { name: accountName })
    : text('COBALT.BANKING.MEMBERS');

  if (!list) {
    return (
      <FleecaPage>
        <SiteHeader />
        <ScreenTitle
          title={title}
          caption={text(
            state.status === 'error' ? 'COBALT.BANKING.MEMBERS_FAILED' : 'COBALT.BANKING.LOADING',
          )}
        />
      </FleecaPage>
    );
  }

  const updateMembers = (members: BankingMember[]) =>
    setState({ status: 'ready', list: { ...list, members } });

  const remove = async (member: BankingMember) => {
    const result = await bankingApi.revoke(accountId, member.citizenid);
    if ('reason' in result) {
      addAlert({ type: 'error', message: text(failureKey(result.reason)) });
      return;
    }

    updateMembers(list.members.filter((entry) => entry.citizenid !== member.citizenid));
    addAlert({
      type: 'success',
      message: text('COBALT.BANKING.MEMBER_REMOVED', { name: member.name }),
    });
  };

  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    const target = citizenid.trim().toUpperCase();
    if (!target || busy) return;

    setBusy(true);
    const result = await bankingApi.invite(accountId, target);
    setBusy(false);

    if ('reason' in result) {
      addAlert({ type: 'error', message: text(failureKey(result.reason)) });
      return;
    }

    updateMembers([...list.members, result.data]);
    setInviteOpen(false);
    setCitizenid('');
    addAlert({
      type: 'success',
      message: text('COBALT.BANKING.MEMBER_ADDED', { name: result.data.name }),
    });
  };

  const canInvite = list.canManage && list.members.length < list.maxMembers;
  const caption = business
    ? list.role === 'viewer'
      ? text('COBALT.BANKING.VIEW_ONLY_CAPTION')
      : text('COBALT.BANKING.BUSINESS_CAPTION')
    : text('COBALT.BANKING.JOINT_CAPTION', { name: accountName });

  return (
    <FleecaPage>
      <SiteHeader />
      <ScreenTitle title={title} caption={caption} />
      <section className="flex flex-col px-4">
        {list.members.map((member, index) => {
          const self = member.citizenid === list.selfCitizenid;
          const removable = list.canManage && member.role !== 'owner' && !self;
          const role = text((business ? businessRoleKey : jointRoleKey)[member.role]);
          const sub = business
            ? member.rank ?? role
            : `${text('COBALT.BANKING.CITIZEN_ID_VALUE', { id: member.citizenid })}${
                self ? '' : ` · ${role}`
              }`;

          return (
            <div key={member.citizenid} className={rowClass(index === 0)}>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-[15px] leading-5">
                  {self ? text('COBALT.BANKING.YOU', { name: member.name }) : member.name}
                </p>
                <p className="truncate text-xs leading-4 text-[#555A55]">{sub}</p>
              </div>
              {removable ? (
                <TextLink onClick={() => remove(member)}>
                  {text('COBALT.BANKING.REMOVE_MEMBER')}
                </TextLink>
              ) : (
                <p
                  className={
                    member.role === 'viewer'
                      ? 'text-sm leading-5 text-[#555A55]'
                      : 'text-sm leading-5'
                  }
                >
                  {business || self ? role : ''}
                </p>
              )}
            </div>
          );
        })}
        <RowEnd />
        <p className="pt-2.5 text-xs leading-4 text-[#555A55]">
          {text(business ? 'COBALT.BANKING.BUSINESS_FOOTNOTE' : 'COBALT.BANKING.JOINT_FOOTNOTE', {
            count: list.maxMembers,
          })}
        </p>
      </section>
      {canInvite && (
        <div className="flex flex-col items-center px-4 pt-4">
          {inviteOpen ? (
            <form className="flex w-full flex-col gap-2" onSubmit={invite}>
              <label className="flex flex-col gap-1">
                <span className="text-[13px] leading-[18px] text-[#555A55]">
                  {text('COBALT.BANKING.CITIZEN_ID')}
                </span>
                <input
                  autoFocus
                  name="citizenid"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={16}
                  value={citizenid}
                  onChange={(event) => setCitizenid(event.target.value)}
                  className="h-11 rounded-sm border border-[#8E938E] bg-[#F3F4F3] px-3 text-base uppercase tracking-[0.04em] outline-none focus:border-[#2F9D46]"
                />
              </label>
              <div className="flex flex-col items-center gap-2 pt-1">
                <FleecaButton type="submit" disabled={!citizenid.trim() || busy}>
                  {text(busy ? 'COBALT.BANKING.ADDING' : 'COBALT.BANKING.ADD_MEMBER')}
                </FleecaButton>
                <TextLink onClick={() => setInviteOpen(false)}>
                  {text('COBALT.BANKING.CANCEL')}
                </TextLink>
              </div>
            </form>
          ) : (
            <FleecaButton onClick={() => setInviteOpen(true)}>
              {text('COBALT.BANKING.ADD_MEMBER')}
            </FleecaButton>
          )}
        </div>
      )}
      {business && (
        <AdStrip
          image={posterAdvisor}
          imageClassName="h-16 w-14 object-[50%_35%]"
          title={text('COBALT.BANKING.AD_ADVISOR_TITLE')}
          body={text('COBALT.BANKING.AD_ADVISOR_BODY')}
        />
      )}
      <div className="h-4 shrink-0" />
    </FleecaPage>
  );
};
