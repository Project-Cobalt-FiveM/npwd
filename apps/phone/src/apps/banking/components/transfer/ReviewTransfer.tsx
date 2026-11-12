import React from 'react';
import { BankingAccount, BankingRecipient } from '@typings/banking';
import { useText } from '@apps/gallery/hooks/useText';
import { endingDigits, formatMoney } from '../../utils/format';
import {
  DetailRow,
  FinePrint,
  FleecaButton,
  FleecaPage,
  RowEnd,
  ScreenTitle,
  SiteHeader,
  TextLink,
} from '../parts';

interface ReviewTransferProps {
  from: BankingAccount;
  recipient: BankingRecipient;
  amount: number;
  note: string;
  sending: boolean;
  onEdit: () => void;
  onSend: () => void;
}

export const ReviewTransfer: React.FC<ReviewTransferProps> = ({
  from,
  recipient,
  amount,
  note,
  sending,
  onEdit,
  onSend,
}) => {
  const text = useText();

  return (
    <FleecaPage>
      <SiteHeader />
      <ScreenTitle
        title={text('COBALT.BANKING.REVIEW_TITLE')}
        caption={text('COBALT.BANKING.REVIEW_CAPTION')}
      />
      <div className="flex flex-col items-center pb-4 pt-1.5">
        <p className="text-[40px] tabular-nums leading-[48px]">{formatMoney(amount)}</p>
        <p className="text-sm leading-5 text-[#555A55]">
          {text('COBALT.BANKING.TO_NAME', { name: recipient.name })}
        </p>
      </div>
      <div className="flex flex-col px-4">
        <DetailRow first label={text('COBALT.BANKING.FROM')}>
          {text('COBALT.BANKING.NAME_ENDING', {
            name: from.name,
            digits: endingDigits(from.accountId),
          })}
        </DetailRow>
        <DetailRow label={text('COBALT.BANKING.TO')}>
          {text('COBALT.BANKING.NAME_ENDING', {
            name: recipient.name,
            digits: endingDigits(recipient.accountId),
          })}
        </DetailRow>
        <DetailRow label={text('COBALT.BANKING.AMOUNT')}>{formatMoney(amount)}</DetailRow>
        {note && <DetailRow label={text('COBALT.BANKING.NOTE')}>{note}</DetailRow>}
        <RowEnd />
      </div>
      <div className="flex flex-col items-center gap-3 px-4 pt-[22px]">
        <FleecaButton disabled={sending} onClick={onSend}>
          {text(sending ? 'COBALT.BANKING.SENDING' : 'COBALT.BANKING.SEND_AMOUNT', {
            amount: formatMoney(amount),
          })}
        </FleecaButton>
        <TextLink disabled={sending} onClick={onEdit}>
          {text('COBALT.BANKING.CHANGE_AMOUNT')}
        </TextLink>
      </div>
      <FinePrint>{text('COBALT.BANKING.FEE_NOTICE')}</FinePrint>
    </FleecaPage>
  );
};
