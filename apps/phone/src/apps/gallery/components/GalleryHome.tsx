import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Check,
  Checks,
  DotsThreeVertical,
  Images,
  MagnifyingGlass,
  ShareFat,
  Trash,
  WarningCircle,
  X,
  XCircle,
} from '@phosphor-icons/react';
import { GalleryPhoto } from '@typings/photo';
import { AppBar, EmptyState, IconButton, usePresence } from '@ui/cobalt';
import { cn } from '@utils/css';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { addQueryToLocation } from '@common/utils/addQueryToLocation';
import { getLocationFromUrl } from '@common/utils/getLocationFromUrl';
import { usePhotoFetchFailed, usePhotosValue } from '../hooks/state';
import { useDeletePhotos } from '../hooks/useDeletePhotos';
import { usePeriodLabel } from '../hooks/usePeriodLabel';
import { groupPhotosByPeriod } from '../utils/sections';
import { PhotoGrid } from './PhotoGrid';
import { ShareSheet } from './ShareSheet';
import { DeleteSheet } from './DeleteSheet';
import { useText } from '../hooks/useText';

type Filter = 'all' | 'albums';
type Sheet = 'share' | 'delete' | null;

const filters: readonly { value: Filter; labelKey: string }[] = [
  { value: 'all', labelKey: 'COBALT.GALLERY.ALL' },
  { value: 'albums', labelKey: 'COBALT.GALLERY.ALBUMS' },
];

const chipClass =
  'flex h-8 items-center gap-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-cb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-primary';

export const GalleryHome: React.FC = () => {
  const t = useText();
  const history = useHistory();
  const query = useQueryParams();
  const photos = usePhotosValue();
  const fetchFailed = usePhotoFetchFailed();
  const periodLabel = usePeriodLabel();
  const deletePhotos = useDeletePhotos();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<number> | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = usePresence(menuOpen, 150);

  const referal = query.referal ? decodeURIComponent(query.referal) : null;
  const sections = useMemo(() => groupPhotosByPeriod(photos, Date.now()), [photos]);
  const needle = search?.trim().toLowerCase() ?? '';
  const visibleSections = needle
    ? sections.filter((section) => periodLabel(section.period).toLowerCase().includes(needle))
    : sections;
  const selectedPhotos = selected ? photos.filter((photo) => selected.has(photo.id)) : [];

  const openCamera = () => history.push('/camera');

  const openPhoto = (photo: GalleryPhoto) => {
    if (referal) {
      history.push(addQueryToLocation(getLocationFromUrl(referal), 'image', photo.image));
      return;
    }
    history.push(`/gallery/${photo.id}`);
  };

  const togglePhoto = (photo: GalleryPhoto) => {
    setSelected((current) => {
      const next = new Set(current ?? []);
      if (next.has(photo.id)) next.delete(photo.id);
      else next.add(photo.id);
      return next.size > 0 ? next : null;
    });
  };

  const startSelection = (photo?: GalleryPhoto) => {
    setMenuOpen(false);
    setSearch(null);
    setSelected(new Set(photo ? [photo.id] : []));
  };

  const selectAll = () => {
    const allSelected = selectedPhotos.length === photos.length;
    setSelected(allSelected ? null : new Set(photos.map((photo) => photo.id)));
  };

  const confirmDelete = async () => {
    const deleted = await deletePhotos(selectedPhotos);
    setSheet(null);
    if (deleted) setSelected(null);
  };

  const renderBar = () => {
    if (selected) {
      return (
        <header className="flex h-[60px] shrink-0 items-center gap-1 bg-cb-muted px-2">
          <IconButton label={t('COBALT.GALLERY.CLEAR_SELECTION')} onClick={() => setSelected(null)}>
            <X size={22} weight="fill" className="text-cb-foreground" />
          </IconButton>
          <p className="min-w-0 flex-1 pl-2 text-[22px] font-semibold tabular-nums leading-7">
            {selected.size}
          </p>
          <IconButton
            label={t('COBALT.GALLERY.SHARE')}
            disabled={selected.size === 0}
            onClick={() => setSheet('share')}
          >
            <ShareFat size={22} weight="fill" className="text-cb-foreground" />
          </IconButton>
          <IconButton
            label={t('COBALT.GALLERY.DELETE')}
            disabled={selected.size === 0}
            onClick={() => setSheet('delete')}
          >
            <Trash size={22} weight="fill" className="text-[#EF4444]" />
          </IconButton>
          <IconButton label={t('COBALT.GALLERY.SELECT_ALL')} onClick={selectAll}>
            <Checks size={22} weight="fill" className="text-cb-foreground" />
          </IconButton>
        </header>
      );
    }

    if (search !== null) {
      return (
        <header className="flex h-16 shrink-0 items-center gap-1 px-2">
          <IconButton label={t('COBALT.GALLERY.CLOSE_SEARCH')} onClick={() => setSearch(null)}>
            <ArrowLeft size={22} weight="fill" className="text-cb-foreground" />
          </IconButton>
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-cb-border bg-cb-muted px-4 text-cb-muted-foreground transition-colors duration-150 ease-cb focus-within:border-cb-primary">
            <input
              type="search"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('COBALT.GALLERY.SEARCH_PLACEHOLDER')}
              aria-label={t('COBALT.GALLERY.SEARCH')}
              className="min-w-0 flex-1 bg-cb-muted text-sm text-cb-foreground placeholder:text-cb-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button
                type="button"
                aria-label={t('COBALT.CLEAR_SEARCH')}
                onClick={() => setSearch('')}
                className="shrink-0 hover:text-cb-foreground"
              >
                <XCircle size={20} weight="fill" />
              </button>
            )}
          </label>
        </header>
      );
    }

    if (referal) {
      return (
        <AppBar
          title={t('COBALT.GALLERY.CHOOSE_PHOTO')}
          back
          actions={
            <IconButton label={t('COBALT.GALLERY.OPEN_CAMERA')} onClick={openCamera}>
              <Camera size={22} weight="fill" />
            </IconButton>
          }
        />
      );
    }

    return (
      <AppBar
        title={t('APPS_GALLERY')}
        actions={
          <>
            <IconButton label={t('COBALT.GALLERY.SEARCH')} onClick={() => setSearch('')}>
              <MagnifyingGlass size={22} weight="fill" />
            </IconButton>
            <IconButton
              label={t('COBALT.GALLERY.MORE')}
              active={menuOpen}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <DotsThreeVertical size={22} weight="fill" />
            </IconButton>
          </>
        }
      />
    );
  };

  const renderContent = () => {
    if (filter === 'albums') {
      return (
        <EmptyState
          icon={<Images size={22} weight="fill" />}
          title={t('COBALT.GALLERY.NO_ALBUMS')}
          className="flex-1 justify-center"
        />
      );
    }

    if (photos.length === 0 && fetchFailed) {
      return (
        <EmptyState
          icon={<WarningCircle size={22} weight="fill" />}
          title={t('COBALT.GALLERY.LOAD_FAILED')}
          caption={t('COBALT.GALLERY.LOAD_FAILED_CAPTION')}
          className="flex-1 justify-center"
        />
      );
    }

    if (photos.length === 0) {
      return (
        <EmptyState
          icon={<Images size={22} weight="fill" />}
          title={t('COBALT.GALLERY.EMPTY')}
          caption={t('COBALT.GALLERY.EMPTY_CAPTION')}
          action={{ label: t('COBALT.GALLERY.OPEN_CAMERA'), onClick: openCamera }}
          className="flex-1 justify-center"
        />
      );
    }

    if (visibleSections.length === 0) {
      return (
        <EmptyState
          icon={<MagnifyingGlass size={22} weight="fill" />}
          title={t('COBALT.GALLERY.NO_RESULTS')}
          className="flex-1 justify-center"
        />
      );
    }

    return (
      <PhotoGrid
        sections={visibleSections}
        selected={selected}
        onOpen={openPhoto}
        onToggle={togglePhoto}
        onLongPress={referal ? undefined : startSelection}
      />
    );
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {renderBar()}
      {!selected && search === null && (
        <div className="flex shrink-0 gap-2 px-4 pb-3 pt-1" role="tablist">
          {filters.map(({ value, labelKey }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(value)}
                className={cn(
                  chipClass,
                  active
                    ? 'bg-cb-primary pl-2.5 pr-3.5 text-cb-foreground'
                    : 'border border-cb-input px-3.5 text-cb-muted-foreground hover:text-cb-foreground',
                )}
              >
                {active && <Check size={16} weight="fill" />}
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      )}
      {renderContent()}

      {menu.mounted && (
        <>
          <div className="absolute inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden />
          <div
            role="menu"
            className={cn(
              'absolute right-2 top-14 z-30 flex min-w-[168px] origin-top-right flex-col rounded-xl border border-cb-border bg-cb-popover py-1 shadow-[0_8px_16px_-8px_#000000] transition duration-150 ease-cb',
              menu.shown ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            )}
          >
            <button
              type="button"
              role="menuitem"
              disabled={photos.length === 0}
              onClick={() => startSelection()}
              className="flex h-11 items-center gap-3 px-4 text-left text-sm hover:bg-cb-muted disabled:text-cb-muted-foreground"
            >
              <Checks size={20} weight="fill" className="text-cb-muted-foreground" />
              {t('COBALT.GALLERY.SELECT')}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={openCamera}
              className="flex h-11 items-center gap-3 px-4 text-left text-sm hover:bg-cb-muted"
            >
              <Camera size={20} weight="fill" className="text-cb-muted-foreground" />
              {t('COBALT.GALLERY.OPEN_CAMERA')}
            </button>
          </div>
        </>
      )}

      <ShareSheet
        photos={selectedPhotos}
        open={sheet === 'share'}
        onClose={() => setSheet(null)}
        onDelete={() => setSheet('delete')}
      />
      <DeleteSheet
        count={selectedPhotos.length}
        open={sheet === 'delete'}
        onClose={() => setSheet(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
