import React from 'react';
import type { IApp } from '@os/apps/config/apps';
import { cn } from '@utils/css';

export interface AppTileProps {
  app: Pick<IApp, 'tile' | 'icon' | 'backgroundColor' | 'color'>;
  size?: number;
  shape?: 'tile' | 'circle';
  className?: string;
}

const radiusFor = (size: number, shape: 'tile' | 'circle') =>
  shape === 'circle' ? size / 2 : Math.round(size * 0.27);

export const AppTile: React.FC<AppTileProps> = ({ app, size = 60, shape = 'tile', className }) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: radiusFor(size, shape),
  };
  const glyphSize = Math.round(size * (shape === 'circle' ? 0.5 : 0.47));
  const tile = app.tile;

  if (tile?.kind === 'lifeinvader') {
    const letterSize = Math.round(size * (shape === 'circle' ? 0.5 : 0.73));
    return (
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden bg-[#D40604]',
          className,
        )}
        style={style}
        aria-hidden
      >
        <span className="absolute inset-x-0 top-0 h-1/2 bg-[#E2544F]" />
        <span
          className="relative font-extrabold leading-none text-white"
          style={{ fontSize: letterSize, WebkitTextStroke: `${Math.max(1, size / 40)}px #D40604` }}
        >
          L
        </span>
      </div>
    );
  }

  if (tile?.kind === 'image') {
    return (
      <div
        className={cn('flex shrink-0 overflow-hidden bg-white', className)}
        style={style}
        aria-hidden
      >
        <img src={tile.src} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  if (tile?.kind === 'glyph') {
    const Glyph = tile.glyph;
    return (
      <div
        className={cn('flex shrink-0 items-center justify-center text-[#FAFAFA]', className)}
        style={{ ...style, backgroundColor: tile.color }}
        aria-hidden
      >
        <Glyph size={glyphSize} weight="fill" />
      </div>
    );
  }

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center overflow-hidden', className)}
      style={{ ...style, backgroundColor: app.backgroundColor, color: app.color }}
      aria-hidden
    >
      {app.icon}
    </div>
  );
};
