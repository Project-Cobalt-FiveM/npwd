import React from 'react';
import { CheckCircle, Info, Warning, WarningCircle } from '@phosphor-icons/react';
import { Snackbar } from '@ui/cobalt';
import { AlertType, useSnackbar } from '../hooks/useSnackbar';

const alertIcons: Record<AlertType, React.ReactNode> = {
  success: <CheckCircle size={20} weight="fill" className="shrink-0 text-[#22C55E]" />,
  error: <WarningCircle size={20} weight="fill" className="shrink-0 text-[#EF4444]" />,
  warning: <Warning size={20} weight="fill" className="shrink-0 text-[#EAB308]" />,
  info: <Info size={20} weight="fill" className="shrink-0 text-cb-primary" />,
};

export const PhoneSnackbar: React.FC = () => {
  const { alert, isOpen, handleClose } = useSnackbar();

  return (
    <Snackbar
      open={isOpen}
      duration={alert?.duration ?? 3000}
      onClose={handleClose}
      message={
        <span className="flex items-center gap-3">
          {alertIcons[alert?.type ?? 'info']}
          <span className="break-words">{alert?.message ?? ''}</span>
        </span>
      }
    />
  );
};
