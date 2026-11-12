import React, { useState } from 'react';
import { BankingAccount } from '@typings/banking';
import { cn } from '@utils/css';
import { useText } from '@apps/gallery/hooks/useText';
import cardFront from '../../assets/fleeca-card-front.jpg';
import { endingDigits, formatMoney } from '../../utils/format';
import {
  AdStrip,
  canSend,
  FleecaButton,
  FleecaPage,
  FOCUS_RING,
  rowClass,
  RowEnd,
  ScreenTitle,
  SiteHeader,
} from '../parts';

interface ChooseAccountProps {
  accounts: BankingAccount[];
  excludeId: string | null;
  selectedId: string | null;
  onPick: (accountId: string) => void;
}

export const ChooseAccount: React.FC<ChooseAccountProps> = ({
  accounts,
  excludeId,
  selectedId,
  onPick,
}) => {
  const text = useText();
  const options = accounts.filter((account) => account.accountId !== excludeId);
  const [choice, setChoice] = useState<string | null>(
    () => selectedId ?? options.find((account) => canSend(account))?.accountId ?? null,
  );

  return (
    <FleecaPage>
      <SiteHeader />
      <ScreenTitle
        title={text('COBALT.BANKING.TRANSFER')}
        caption={text('COBALT.BANKING.STEP_FROM')}
      />
      <div
        role="radiogroup"
        aria-label={text('COBALT.BANKING.STEP_FROM')}
        className="flex flex-col px-4"
      >
        {options.map((account, index) => {
          const usable = canSend(account);
          const checked = account.accountId === choice;

          return (
            <button
              key={account.accountId}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={!usable}
              onClick={() => setChoice(account.accountId)}
              className={cn(rowClass(index === 0), FOCUS_RING, !usable && 'text-[#7A7F7A]')}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                  checked
                    ? 'border-[#28823D]'
                    : usable
                    ? 'border-[#555A55]'
                    : 'border-[#A9AEA9] bg-[#D5D8D5]',
                )}
              >
                {checked && <span className="h-2 w-2 rounded-full bg-[#28823D]" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[15px] leading-5">{account.name}</span>
                <span className="truncate text-xs leading-4 text-[#555A55]">
                  {usable
                    ? text(`COBALT.BANKING.ROW_${account.type.toUpperCase()}`, {
                        digits: endingDigits(account.accountId),
                      })
                    : text('COBALT.BANKING.CANT_PAY_FROM')}
                </span>
              </span>
              <span className="shrink-0 text-[15px] tabular-nums leading-5">
                {formatMoney(account.balance)}
              </span>
            </button>
          );
        })}
        <RowEnd />
      </div>
      <div className="flex justify-center px-4 pt-[22px]">
        <FleecaButton disabled={!choice} onClick={() => choice && onPick(choice)}>
          {text('COBALT.BANKING.CONTINUE')}
        </FleecaButton>
      </div>
      <AdStrip
        image={cardFront}
        imageClassName="h-[45px] rounded border border-[#B9BCB9]"
        title={text('COBALT.BANKING.AD_PLATINUM_TITLE')}
        body={text('COBALT.BANKING.AD_PLATINUM_BODY')}
      />
      <div className="h-4 shrink-0" />
    </FleecaPage>
  );
};
