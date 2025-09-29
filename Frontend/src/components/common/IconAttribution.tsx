import React from 'react';

/**
 * Font Awesome 아이콘 사용을 위한 저작자 표시 컴포넌트
 * CC BY 4.0 라이센스 요구사항 충족
 */
export const IconAttribution: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
      <span>아이콘: </span>
      <a
        href="https://fontawesome.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 underline"
      >
        Font Awesome
      </a>
      <span> (CC BY 4.0)</span>
    </div>
  );
};

export default IconAttribution;
