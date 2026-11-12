import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import { Text, useText } from '@apps/contacts/hooks/useText';
import type { Icon } from '@phosphor-icons/react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneX } from '@phosphor-icons/react';
import { EmptyState } from '@ui/cobalt';
import { cn } from '@utils/css';
import { useCall } from '@os/call/hooks/useCall';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useContactLookup } from '@apps/contacts/hooks/useContactLookup';
import { SearchAppBar } from '@apps/contacts/components/SearchAppBar';
import { useDialHistory } from '../../hooks/useDialHistory';
import { buildCallLog, CallKind, CallLogEntry, groupByPeriod } from '../../utils/callLog';

type Filter = 'all' | 'missed';

const kindIcon: Record<CallKind, Icon> = {
  incoming: PhoneIncoming,
  outgoing: PhoneOutgoing,
  missed: PhoneX,
};

const kindLabel: Record<CallKind, string> = {
  incoming: 'COBALT.DIALER.INCOMING',
  outgoing: 'COBALT.DIALER.OUTGOING',
  missed: 'COBALT.DIALER.MISSED',
};

const callDetail = (entry: CallLogEntry, t: Text): string => {
  const kind = t(kindLabel[entry.kind]);
  if (entry.count > 1) return `${kind} · ${t('COBALT.DIALER.CALL_COUNT', { count: entry.count })}`;
  if (entry.durationSeconds == null) return kind;
  const duration =
    entry.durationSeconds >= 60
      ? t('COBALT.DIALER.DURATION_MIN', { count: Math.round(entry.durationSeconds / 60) })
      : t('COBALT.DIALER.DURATION_SEC', { count: entry.durationSeconds });
  return `${kind} · ${duration}`;
};

const callTime = (startedAt: dayjs.Dayjs, t: Text): string => {
  const today = dayjs();
  if (startedAt.isSame(today, 'day')) return startedAt.format('HH:mm');
  if (startedAt.isSame(today.subtract(1, 'day'), 'day')) return t('COBALT.DIALER.YESTERDAY');
  if (today.diff(startedAt, 'day') < 7) return startedAt.format('ddd');
  return startedAt.format('DD/MM');
};

const FilterChip: React.FC<{ selected: boolean; onClick: () => void; children: string }> = ({
  selected,
  onClick,
  children,
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      'flex h-8 items-center rounded-lg px-4 text-sm font-medium leading-5 transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary',
      selected
        ? 'bg-cb-primary text-cb-foreground'
        : 'border border-cb-input text-cb-muted-foreground hover:text-cb-foreground',
    )}
  >
    {children}
  </button>
);

export const Recents: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const calls = useDialHistory();
  const myNumber = useMyPhoneNumber();
  const findContact = useContactLookup();
  const { initializeCall } = useCall();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const log = useMemo(() => buildCallLog(calls, myNumber), [calls, myNumber]);

  const nameOf = (entry: CallLogEntry): string =>
    entry.anonymous ? t('COBALT.DIALER.PRIVATE_NUMBER') : findContact(entry.peer)?.display ?? entry.peer;

  const needle = query.trim().toLowerCase();
  const visible = log.filter(
    (entry) =>
      (filter === 'all' || entry.kind === 'missed') &&
      (!needle || nameOf(entry).toLowerCase().includes(needle) || entry.peer.includes(needle)),
  );
  const groups = groupByPeriod(visible);

  const openEntry = (entry: CallLogEntry) => {
    if (entry.anonymous) return;
    const contact = findContact(entry.peer);
    history.push(
      contact
        ? `/contacts/${contact.id}`
        : `/contacts/-1?addNumber=${encodeURIComponent(entry.peer)}&referal=/phone`,
    );
  };

  const openKeypad = () => history.push('/phone/dial');

  const empty = (() => {
    if (log.length === 0)
      return {
        title: t('COBALT.DIALER.NO_RECENTS'),
        caption: t('COBALT.DIALER.NO_RECENTS_CAPTION'),
        action: { label: t('COBALT.DIALER.OPEN_KEYPAD'), onClick: openKeypad },
      };
    if (needle) return { title: t('COBALT.DIALER.NO_MATCHES') };
    return { title: t('COBALT.DIALER.NO_MISSED') };
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SearchAppBar
        title={t('COBALT.DIALER.RECENTS')}
        searchLabel={t('COBALT.DIALER.SEARCH_CALLS')}
        query={query}
        onQueryChange={setQuery}
      />
      {log.length > 0 && (
        <div className="flex shrink-0 gap-2 px-5 pb-2">
          <FilterChip selected={filter === 'all'} onClick={() => setFilter('all')}>
            {t('COBALT.DIALER.FILTER_ALL')}
          </FilterChip>
          <FilterChip selected={filter === 'missed'} onClick={() => setFilter('missed')}>
            {t('COBALT.DIALER.FILTER_MISSED')}
          </FilterChip>
        </div>
      )}
      {groups.length === 0 ? (
        <EmptyState
          icon={log.length === 0 ? <Phone size={20} weight="fill" /> : <PhoneX size={20} weight="fill" />}
          title={empty.title}
          caption={empty.caption}
          action={empty.action}
          className="flex-1 justify-center px-10 pb-12"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          {groups.map((group) => (
            <section key={group.period}>
              <h2 className="px-2 pb-1 pt-2 text-xs font-medium leading-4 text-[#737373]">
                {t(group.period === 'today' ? 'COBALT.DIALER.TODAY' : 'COBALT.DIALER.EARLIER')}
              </h2>
              {group.entries.map((entry) => (
                <CallRow
                  key={entry.key}
                  name={nameOf(entry)}
                  entry={entry}
                  detail={callDetail(entry, t)}
                  time={callTime(entry.startedAt, t)}
                  callLabel={t('COBALT.DIALER.CALL')}
                  onOpen={() => openEntry(entry)}
                  onCall={() => initializeCall(entry.peer)}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

interface CallRowProps {
  name: string;
  entry: CallLogEntry;
  detail: string;
  time: string;
  callLabel: string;
  onOpen: () => void;
  onCall: () => void;
}

const CallRow: React.FC<CallRowProps> = ({ name, entry, detail, time, callLabel, onOpen, onCall }) => {
  const KindIcon = kindIcon[entry.kind];
  const missed = entry.kind === 'missed';

  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 ease-cb hover:bg-cb-card">
      <button
        type="button"
        onClick={onOpen}
        disabled={entry.anonymous}
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary disabled:cursor-default"
      >
        <KindIcon
          size={20}
          weight="fill"
          className={cn('shrink-0', missed ? 'text-[#EF4444]' : 'text-cb-muted-foreground')}
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm font-medium leading-5 tabular-nums',
              missed ? 'text-[#EF4444]' : 'text-cb-foreground',
            )}
          >
            {name}
          </span>
          <span className="block truncate text-xs leading-4 text-cb-muted-foreground">{detail}</span>
        </span>
        <span className="w-16 shrink-0 text-right text-xs leading-4 tabular-nums text-cb-muted-foreground">
          {time}
        </span>
      </button>
      <button
        type="button"
        aria-label={`${callLabel} ${name}`}
        title={callLabel}
        onClick={onCall}
        disabled={entry.anonymous}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-cb-muted-foreground transition-colors duration-150 ease-cb hover:bg-cb-secondary hover:text-cb-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary disabled:invisible"
      >
        <Phone size={20} weight="fill" />
      </button>
    </div>
  );
};
