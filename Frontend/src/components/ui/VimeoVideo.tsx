import React from 'react';
import { useAnimation } from '../../hooks/useAnimation';

interface VimeoVideoProps {
  videoId: string;
  title: string;
  delay?: number;
  className?: string;
}

export const VimeoVideo: React.FC<VimeoVideoProps> = ({
  videoId,
  title,
  delay = 0,
  className = '',
}) => {
  const isVisible = useAnimation(delay);

  return (
    <div
      className={`w-full transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&badge=0&transparent=0&background=1&volume=0`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            title={title}
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};
