import React from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, XCircle } from '@phosphor-icons/react';

interface HomeSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export const HomeSearch: React.FC<HomeSearchProps> = ({ query, onQueryChange }) => {
  const [t] = useTranslation();

  return (
    <label className="flex h-12 w-full shrink-0 items-center gap-3 rounded-full border border-cb-border bg-cb-muted px-4 text-cb-muted-foreground transition-colors duration-150 ease-cb focus-within:border-cb-primary">
      <MagnifyingGlass size={20} weight="fill" className="shrink-0" />
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t('COBALT.SEARCH_APPS')}
        aria-label={t('COBALT.SEARCH_APPS')}
        className="min-w-0 flex-1 bg-cb-muted text-sm text-cb-foreground placeholder:text-cb-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          aria-label={t('COBALT.CLEAR_SEARCH')}
          onClick={() => onQueryChange('')}
          className="shrink-0 hover:text-cb-foreground"
        >
          <XCircle size={20} weight="fill" />
        </button>
      )}
    </label>
  );
};
