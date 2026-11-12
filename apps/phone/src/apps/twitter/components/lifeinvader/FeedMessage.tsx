import React from 'react';

interface FeedMessageProps {
  title: string;
  caption?: string;
}

export const FeedMessage: React.FC<FeedMessageProps> = ({ title, caption }) => (
  <div className="flex flex-col items-center gap-1 rounded border border-[#D9D9D9] bg-white px-6 py-8 text-center">
    <p className="text-[15px] font-bold leading-5 text-[#1F1F1F]">{title}</p>
    {caption && <p className="text-[13px] leading-[18px] text-[#6B6B6B]">{caption}</p>}
  </div>
);
