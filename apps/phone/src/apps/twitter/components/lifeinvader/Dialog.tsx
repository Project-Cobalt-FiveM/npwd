import React from 'react';
import { cn } from '@utils/css';
import { usePresence } from '@ui/cobalt';

interface DialogProps {
  open: boolean;
  label: string;
  onDismiss?: () => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, label, onDismiss, children }) => {
  const { mounted, shown } = usePresence(open, 200);
  if (!mounted) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-30 flex flex-col justify-center overflow-y-auto bg-[#8C8C8C] p-5 transition-opacity duration-200 ease-cb',
        shown ? 'opacity-100' : 'opacity-0',
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss?.();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          'flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_#5A5A5A] transition-transform duration-200 ease-cb',
          shown ? 'scale-100' : 'scale-95',
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface DialogButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'brand' | 'muted';
}

export const DialogButton: React.FC<DialogButtonProps> = ({
  tone = 'brand',
  className,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={cn(
      'h-10 shrink-0 rounded-[20px] bg-white px-3.5 text-[15px] font-bold leading-[18px] transition-colors duration-150 ease-cb hover:bg-[#EDEDED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40604] disabled:bg-white disabled:text-[#BDBDBD]',
      tone === 'brand' ? 'text-[#D40604]' : 'text-[#6B6B6B]',
      className,
    )}
    {...rest}
  />
);
