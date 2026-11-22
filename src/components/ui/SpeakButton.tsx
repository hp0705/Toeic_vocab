import React, { useState } from 'react';
import { Volume2, Turtle } from 'lucide-react';
import { speak } from '../../audio/speak';

export interface SpeakButtonProps {
  text: string;
  accent?: 'us' | 'uk';
  size?: 'sm' | 'md' | 'lg';
  showSlowOption?: boolean;
  className?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  accent = 'us',
  size = 'md',
  showSlowOption = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowPlaying, setIsSlowPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent, rate = 1.0) => {
    e.stopPropagation();
    if (rate < 1.0) {
      setIsSlowPlaying(true);
    } else {
      setIsPlaying(true);
    }

    speak(text, {
      accent,
      rate,
      onEnd: () => {
        setIsPlaying(false);
        setIsSlowPlaying(false);
      },
      onError: () => {
        setIsPlaying(false);
        setIsSlowPlaying(false);
      }
    });
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26
  }[size];

  const buttonSizes = {
    sm: 'p-1.5 min-h-[36px] min-w-[36px]',
    md: 'p-2 min-h-[44px] min-w-[44px]',
    lg: 'p-3 min-h-[52px] min-w-[52px]'
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={(e) => handlePlay(e, 1.0)}
        aria-label={`Phát âm từ ${text} (${accent.toUpperCase()})`}
        className={`inline-flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all cursor-pointer ${buttonSizes} ${
          isPlaying ? 'ring-2 ring-primary animate-pulse' : ''
        }`}
      >
        <Volume2 size={iconSizes} />
      </button>

      {showSlowOption && (
        <button
          type="button"
          onClick={(e) => handlePlay(e, 0.75)}
          aria-label={`Phát âm chậm từ ${text}`}
          title="Nghe chậm (0.75x)"
          className={`inline-flex items-center justify-center rounded-full bg-surface-2 text-text-muted hover:text-text hover:bg-border active:scale-95 transition-all cursor-pointer p-1.5 min-h-[36px] min-w-[36px] ${
            isSlowPlaying ? 'ring-2 ring-primary animate-pulse' : ''
          }`}
        >
          <Turtle size={iconSizes - 4} />
        </button>
      )}
    </div>
  );
};
