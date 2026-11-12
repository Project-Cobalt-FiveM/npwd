import React, { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { AppBar, IconButton } from '@ui/cobalt';
import { NPWDInput } from '@ui/components';
import { toggleKeys } from '@ui/components/Input';

export interface SearchAppBarProps {
  title: string;
  searchLabel: string;
  query: string;
  onQueryChange: (query: string) => void;
}

export const SearchAppBar: React.FC<SearchAppBarProps> = ({
  title,
  searchLabel,
  query,
  onQueryChange,
}) => {
  const [searching, setSearching] = useState(false);

  const closeSearch = () => {
    setSearching(false);
    onQueryChange('');
  };

  if (searching) {
    return (
      <AppBar
        className="pr-4"
        onBack={closeSearch}
        title={
          <NPWDInput
            autoFocus
            onFocus={() => toggleKeys(false)}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="h-10 w-full rounded-md border-0 bg-cb-background px-0 text-base text-cb-foreground placeholder:text-cb-muted-foreground focus:outline-none focus:ring-0 dark:bg-cb-background dark:text-cb-foreground"
          />
        }
      />
    );
  }

  return (
    <AppBar
      className="pl-5 pr-1"
      title={<span className="font-semibold">{title}</span>}
      actions={
        <IconButton label={searchLabel} onClick={() => setSearching(true)} className="h-12 w-12">
          <MagnifyingGlass size={24} weight="fill" />
        </IconButton>
      }
    />
  );
};
