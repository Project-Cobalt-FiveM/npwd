import React from 'react';
import { useText } from '@apps/gallery/hooks/useText';
import branchPhoto from '../assets/branch.jpg';
import { FleecaButton, FleecaPage, SiteHeader } from './parts';

interface BranchNoticeProps {
  title: string;
  caption: string;
  retrying?: boolean;
  onRetry?: () => void;
}

export const BranchNotice: React.FC<BranchNoticeProps> = ({
  title,
  caption,
  retrying,
  onRetry,
}) => {
  const text = useText();

  return (
    <FleecaPage className="items-center">
      <div className="self-stretch">
        <SiteHeader />
      </div>
      <div className="relative mt-4 h-[330px] w-[368px] shrink-0 overflow-hidden border border-[#C3C7C3]">
        <img
          src={branchPhoto}
          alt="Fleeca branch, Pillbox Hill"
          className="absolute left-[-150px] top-0 h-[330px] w-[684px] max-w-none object-cover"
        />
        <span className="absolute left-[150px] top-[138px] h-4 w-[60px] -rotate-[5deg] border border-[#CFC8A6] bg-[#E9E3C4]" />
        <div className="absolute left-[84px] top-[148px] flex w-[200px] -rotate-3 flex-col gap-1.5 border border-[#CFCFCA] bg-[#FBFBF7] px-3.5 pb-3.5 pt-4 text-center shadow-[0_4px_0_#3A3A38]">
          <p className="font-['Arial_Black',Arimo,sans-serif] text-[19px] font-black leading-[22px]">
            {text('COBALT.BANKING.NOTICE_TITLE')}
          </p>
          <p className="text-xs leading-4">{text('COBALT.BANKING.NOTICE_LINE')}</p>
          <p className="text-xs leading-4">{text('COBALT.BANKING.NOTICE_SAFE')}</p>
          <p className="text-[9px] leading-3 text-[#555A55]">
            {text('COBALT.BANKING.NOTICE_TERMS')}
          </p>
          <p className="pt-0.5 text-[10px] leading-3 text-[#555A55]">
            {text('COBALT.BANKING.NOTICE_SIGNED')}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 px-6 pt-[18px] text-center">
        <h1 className="text-lg font-normal leading-6">{title}</h1>
        <p className="text-[13px] leading-[18px] text-[#555A55]">{caption}</p>
      </div>
      {onRetry && (
        <div className="pt-4">
          <FleecaButton disabled={retrying} onClick={onRetry}>
            {text(retrying ? 'COBALT.BANKING.TRYING' : 'COBALT.BANKING.TRY_AGAIN')}
          </FleecaButton>
        </div>
      )}
    </FleecaPage>
  );
};
