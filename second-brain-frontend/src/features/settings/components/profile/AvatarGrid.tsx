import React from 'react';
import { AvatarCard } from './AvatarCard';

interface AvatarGridProps {
  avatars: string[];
  currentAvatar?: string;
  onSelect: (url: string) => void;
}

export const AvatarGrid: React.FC<AvatarGridProps> = ({ avatars, currentAvatar, onSelect }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {avatars.map((url, index) => (
        <AvatarCard
          key={url}
          url={url}
          index={index}
          isSelected={currentAvatar === url}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
