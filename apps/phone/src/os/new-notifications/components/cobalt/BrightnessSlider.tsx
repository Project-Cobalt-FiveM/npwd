import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun } from '@phosphor-icons/react';
import { minBrightness } from '@os/quick-settings/state';

interface BrightnessSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const BrightnessSlider: React.FC<BrightnessSliderProps> = ({ value, onChange }) => {
  const [t] = useTranslation();
  const percent = ((value - minBrightness) / (1 - minBrightness)) * 100;

  return (
    <div className="relative flex h-11 w-full shrink-0 overflow-hidden rounded-full bg-cb-secondary">
      <div
        className="flex h-11 min-w-[44px] items-center rounded-full bg-cb-primary pl-3.5"
        style={{ width: `${percent}%` }}
      >
        <Sun size={18} weight="fill" className="text-cb-foreground" />
      </div>
      <input
        type="range"
        min={minBrightness}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={t('COBALT.BRIGHTNESS')}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      />
    </div>
  );
};
