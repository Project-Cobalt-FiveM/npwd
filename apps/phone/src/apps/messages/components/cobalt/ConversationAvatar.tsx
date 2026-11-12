import React from 'react';
import { CheckCircle, User } from '@phosphor-icons/react';
import { Avatar } from '@ui/cobalt';
import { ConversationDisplay } from '../../hooks/useConversationDisplay';

interface ConversationAvatarProps {
  display: ConversationDisplay;
  isGroup: boolean;
  size?: number;
  selected?: boolean;
}

export const ConversationAvatar: React.FC<ConversationAvatarProps> = ({
  display,
  isGroup,
  size = 40,
  selected,
}) => {
  if (selected) {
    return <CheckCircle size={size} weight="fill" className="shrink-0 text-cb-foreground" />;
  }

  const [first, second] = display.members;

  if (!isGroup || !second) {
    const name = first?.name ?? display.name;
    if (!first?.avatar && !/[a-z]/i.test(name)) {
      return (
        <div
          className="flex shrink-0 items-center justify-center rounded-full bg-cb-secondary text-cb-muted-foreground"
          style={{ width: size, height: size }}
        >
          <User size={Math.round(size / 2)} weight="fill" />
        </div>
      );
    }
    return <Avatar name={name} src={first?.avatar} size={size} />;
  }

  const small = Math.round(size * 0.7);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Avatar name={first.name} src={first.avatar} size={small} className="absolute left-0 top-0" />
      <Avatar
        name={second.name}
        src={second.avatar}
        size={small}
        className="absolute bottom-0 right-0 border-2 border-cb-background"
      />
    </div>
  );
};
