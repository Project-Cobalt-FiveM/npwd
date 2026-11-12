import React from 'react';
import { NPWDInput } from '@ui/components/Input';
import { cn } from '@utils/css';

interface FieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  inputClassName,
  ...rest
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold leading-4 text-[#6B6B6B]">{label}</span>
    <NPWDInput
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-10 rounded-sm border border-[#D9D9D9] bg-[#F7F7F7] px-3 py-0 text-sm leading-[18px] text-[#1F1F1F] transition-colors duration-150 ease-cb placeholder:text-[#6B6B6B] read-only:text-[#6B6B6B] focus:border-2 focus:border-[#D40604] focus:bg-white focus:px-[11px] dark:bg-[#F7F7F7] dark:text-[#1F1F1F] dark:focus:bg-white',
        inputClassName,
      )}
      {...rest}
    />
  </label>
);
