import React, { useState } from 'react';
import { BankingAccount, BankingRecipient, BankingTransferReceipt } from '@typings/banking';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { setClipboard } from '@os/phone/hooks/useClipboard';
import { useText } from '@apps/gallery/hooks/useText';
import logoClear from '../../assets/fleeca-logo-clear.png';
import { endingDigits, formatFullDate } from '../../utils/format';
import { FleecaButton, FleecaPage, ScreenTitle, SiteHeader, TextLink } from '../parts';

interface TransferSuccessProps {
  from: BankingAccount;
  recipient: BankingRecipient;
  amount: number;
  note: string;
  receipt: BankingTransferReceipt;
  onDone: () => void;
  onReceipt: () => void;
}

const slipMoney = (amount: number): string =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SlipLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex gap-3">
    <span className="shrink-0 whitespace-nowrap">{label}</span>
    <span className="min-w-0 flex-1 truncate text-right">{value}</span>
  </div>
);

export const TransferSuccess: React.FC<TransferSuccessProps> = ({
  from,
  recipient,
  amount,
  note,
  receipt,
  onDone,
  onReceipt,
}) => {
  const text = useText();
  const { addAlert } = useSnackbar();
  const [sentAt] = useState(() => Math.floor(Date.now() / 1000));

  const copyReference = () => {
    setClipboard(receipt.receipt);
    addAlert({ type: 'success', message: text('COBALT.BANKING.REFERENCE_COPIED') });
  };

  return (
    <FleecaPage className="items-center">
      <div className="self-stretch">
        <SiteHeader />
      </div>
      <ScreenTitle
        title={text('COBALT.BANKING.MONEY_SENT')}
        caption={text('COBALT.BANKING.MONEY_SENT_CAPTION')}
      />
      <article
        aria-label={text('COBALT.BANKING.ADVICE_SLIP')}
        className="flex w-[280px] shrink-0 animate-cb-pop flex-col border border-[#CFCFCA] bg-[#FBFBF7] font-['Courier_New',monospace] text-xs uppercase leading-[17px] text-[#2A2A28] shadow-[0_6px_0_#D2D3CF] motion-reduce:animate-none"
      >
        <div className="flex flex-col items-center gap-1 px-4 pb-2 pt-3.5">
          <img src={logoClear} alt="Fleeca Bank" className="h-[34px] w-[84px]" />
          <p className="font-bold tracking-[0.2em]">{text('COBALT.BANKING.ADVICE_SLIP')}</p>
          <p>{text('COBALT.BANKING.SLIP_BRANCH')}</p>
        </div>
        <div className="mx-4 border-t border-dashed border-[#8A8A84]" />
        <div className="flex flex-col px-4 py-2">
          <SlipLine
            label={text('COBALT.BANKING.SLIP_DATE')}
            value={formatFullDate(sentAt).replace(',', '')}
          />
          <SlipLine
            label={text('COBALT.BANKING.FROM')}
            value={`${from.name} ..${endingDigits(from.accountId)}`}
          />
          <SlipLine
            label={text('COBALT.BANKING.TO')}
            value={`${recipient.name} ..${endingDigits(recipient.accountId)}`}
          />
          {note && <SlipLine label={text('COBALT.BANKING.NOTE')} value={note} />}
        </div>
        <div className="mx-4 border-t border-dashed border-[#8A8A84]" />
        <div className="flex flex-col px-4 py-2 tabular-nums">
          <SlipLine label={text('COBALT.BANKING.AMOUNT')} value={slipMoney(amount)} />
          <SlipLine label={text('COBALT.BANKING.SLIP_FEE')} value={slipMoney(receipt.fee)} />
          <SlipLine
            label={text('COBALT.BANKING.SLIP_DAMAGE')}
            value={text('COBALT.BANKING.SLIP_FREE')}
          />
          <SlipLine
            label={text('COBALT.BANKING.SLIP_BALANCE')}
            value={slipMoney(receipt.balance)}
          />
        </div>
        <div className="mx-4 border-t border-dashed border-[#8A8A84]" />
        <div className="flex flex-col items-center gap-0.5 px-4 pb-3.5 pt-2 text-center">
          <p className="font-bold">
            {text('COBALT.BANKING.SLIP_REF', { reference: receipt.receipt })}
          </p>
          <p>{text('COBALT.BANKING.SLIP_THANKS')}</p>
          <p>{text('COBALT.BANKING.SLIP_AGAIN')}</p>
        </div>
      </article>
      <div className="flex flex-col items-center gap-2.5 px-4 pt-[22px]">
        <FleecaButton onClick={onDone}>{text('COBALT.BANKING.DONE')}</FleecaButton>
        <div className="flex gap-[18px]">
          <TextLink onClick={copyReference}>{text('COBALT.BANKING.COPY_REFERENCE')}</TextLink>
          <TextLink onClick={onReceipt}>{text('COBALT.BANKING.VIEW_TRANSACTION')}</TextLink>
        </div>
      </div>
      <div className="h-4 shrink-0" />
    </FleecaPage>
  );
};
