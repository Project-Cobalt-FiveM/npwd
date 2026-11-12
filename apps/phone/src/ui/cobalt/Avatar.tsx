import React from 'react';
import { cn } from '@utils/css';

const avatarColors = [
  '#2563EB',
  '#0D9488',
  '#16A34A',
  '#B45309',
  '#DB2777',
  '#9333EA',
  '#475569',
  '#0891B2',
] as const;

export const avatarColor = (name: string): string => {
  const hash = Array.from(name).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
  return avatarColors[hash % avatarColors.length];
};

export const initials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '#';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  color?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 40, color, className }) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.38),
    backgroundColor: color ?? avatarColor(name),
  };

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold leading-none text-cb-foreground',
        className,
      )}
      style={style}
      aria-label={name}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
};
