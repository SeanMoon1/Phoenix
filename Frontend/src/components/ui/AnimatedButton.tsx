import React from 'react';
import { useAnimation } from '../../hooks/useAnimation';

interface AnimatedButtonProps {
  children: React.ReactNode;
  delay?: number;
  href?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  delay = 0,
  href,
  variant = 'primary',
  className = '',
  onClick,
}) => {
  const isVisible = useAnimation(delay);

  const baseClasses =
    'inline-block px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-500 ease-out transform hover:scale-105 active:scale-95';

  const variantClasses = {
    primary:
      'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-500 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 dark:hover:shadow-orange-400/25',
    secondary:
      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
  };

  const animationClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-8';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`;

  if (href) {
    return (
      <a href={href} className={buttonClasses}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
};
