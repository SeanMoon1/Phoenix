import React from 'react';
import { useAnimation } from '../../hooks/useAnimation';

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight';
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  animation = 'fadeIn',
  className = '',
}) => {
  const isVisible = useAnimation(delay);

  const getAnimationClasses = () => {
    if (!isVisible) {
      const hiddenClasses = {
        slideUp: 'translate-y-8 opacity-0',
        slideDown: '-translate-y-8 opacity-0',
        slideLeft: 'translate-x-8 opacity-0',
        slideRight: '-translate-x-8 opacity-0',
        fadeIn: 'opacity-0',
      };
      return hiddenClasses[animation];
    }

    const visibleClasses = {
      slideUp: 'translate-y-0 opacity-100',
      slideDown: 'translate-y-0 opacity-100',
      slideLeft: 'translate-x-0 opacity-100',
      slideRight: 'translate-x-0 opacity-100',
      fadeIn: 'opacity-100',
    };
    return visibleClasses[animation];
  };

  return (
    <div
      className={`transition-all duration-1000 ease-out transform ${getAnimationClasses()} ${className}`}
    >
      {children}
    </div>
  );
};
