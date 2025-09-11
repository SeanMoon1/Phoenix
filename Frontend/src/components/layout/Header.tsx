import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 각 드롭다운 상태 관리
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  // 모바일 서브메뉴 상태 관리
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  // 각 드롭다운 ref
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // 관리자 페이지 여부 확인
  const isAdminPage = location.pathname.startsWith('/admin');

  // 다크모드 상태를 로컬스토리지와 동기화
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 스크롤 이벤트 리스너 추가
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const shouldBeFixed = scrollTop > 10;
      // console.log(
      //   'Scroll position:',
      //   scrollTop,
      //   'Should be fixed:',
      //   shouldBeFixed
      // );
      setIsScrolled(shouldBeFixed);

      // 모바일 메뉴가 열린 상태에서 스크롤 시 메뉴 닫기
      if (isMobileMenuOpen && scrollTop > 0) {
        setIsMobileMenuOpen(false);
        setMobileAdminOpen(false);
      }
    };

    // 초기 스크롤 위치 확인
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileMenuOpen]);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refs = [adminDropdownRef];
      const isOutside = refs.every(
        ref => !ref.current || !ref.current.contains(event.target as Node)
      );

      if (isOutside) {
        setIsAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // 모바일 메뉴가 닫힐 때 모든 서브메뉴도 닫기
    if (isMobileMenuOpen) {
      setMobileAdminOpen(false);
    }
  };

  // 드롭다운 토글 함수들
  const toggleAdminDropdown = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
  };

  // 모바일 서브메뉴 토글 함수들
  const toggleMobileAdmin = () => setMobileAdminOpen(!mobileAdminOpen);

  return (
    <>
      <header
        className={`bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300 z-50 ${
          isScrolled
            ? 'fixed top-0 left-0 right-0 shadow-xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95'
            : 'relative'
        }`}
      >
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text dark:from-orange-400 dark:to-red-400">
                  재난훈련ON
                </span>
              </Link>
            </div>

            {/* 네비게이션 - 데스크톱 */}
            <nav className="relative items-center hidden space-x-1 lg:flex xl:space-x-2">
              {/* 상황별 행동 메뉴얼 */}
              <Link
                to="/manual"
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg whitespace-nowrap dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                상황별 행동 메뉴얼
              </Link>

              {/* 훈련하기 */}
              <Link
                to="/training"
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg whitespace-nowrap dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                훈련하기
              </Link>

              {/* 마이페이지 */}
              <Link
                to="/mypage"
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg whitespace-nowrap dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                마이페이지
              </Link>

              {/* 고객지원 */}
              <Link
                to="/support"
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg whitespace-nowrap dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                고객지원
              </Link>

              {/* 관리자 드롭다운 - 관리자 페이지에서만 표시 */}
              {isAdminPage && (
                <div className="relative" ref={adminDropdownRef}>
                  <button
                    onClick={toggleAdminDropdown}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-1 ${
                      isAdminDropdownOpen
                        ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  >
                    <span>관리자페이지</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isAdminDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* 관리자 드롭다운 메뉴 */}
                  {isAdminDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                      <Link
                        to="/admin"
                        className="block px-4 py-3 text-sm text-gray-700 transition-all duration-200 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 first:rounded-t-lg"
                        onClick={() => setIsAdminDropdownOpen(false)}
                      >
                        통계
                      </Link>
                      <Link
                        to="/admin/scenarios"
                        className="block px-4 py-3 text-sm text-gray-700 transition-all duration-200 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        onClick={() => setIsAdminDropdownOpen(false)}
                      >
                        훈련 시나리오 관리
                      </Link>
                      <Link
                        to="/admin/users"
                        className="block px-4 py-3 text-sm text-gray-700 transition-all duration-200 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 last:rounded-b-lg"
                        onClick={() => setIsAdminDropdownOpen(false)}
                      >
                        이용자 관리
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* 우측 메뉴 (다크모드 토글, 사용자 메뉴) */}
            <div className="flex items-center space-x-3">
              {/* 다크모드 토글 버튼 */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 transition-all duration-200 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400"
                aria-label="다크모드 토글"
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* 사용자 메뉴 */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="hidden text-sm font-medium text-gray-700 sm:block dark:text-gray-300">
                    {user?.name}님
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400"
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-700 border-gray-300 dark:border-gray-500 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      로그인
                    </Button>
                  </Link>
                </div>
              )}

              {/* 모바일 햄버거 메뉴 버튼 */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-700 transition-all duration-200 bg-gray-100 rounded-lg lg:hidden dark:bg-gray-800 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400"
                aria-label="모바일 메뉴"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 모바일 햄버거 메뉴 */}
          {isMobileMenuOpen && (
            <div className="py-4 border-t border-gray-200 lg:hidden dark:border-gray-700">
              <nav className="space-y-2">
                {/* 상황별 행동 메뉴얼 */}
                <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    to="/manual"
                    className="block px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    상황별 행동 메뉴얼
                  </Link>
                </div>

                {/* 훈련하기 */}
                <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    to="/training"
                    className="block px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    훈련하기
                  </Link>
                </div>

                {/* 마이페이지 */}
                <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    to="/mypage"
                    className="block px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                </div>

                {/* 고객지원 */}
                <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    to="/support"
                    className="block px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    고객지원
                  </Link>
                </div>

                {/* 관리자 섹션 - 관리자 페이지에서만 표시 */}
                {isAdminPage && (
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={toggleMobileAdmin}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 rounded-lg dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <span>관리자페이지</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          mobileAdminOpen ? 'rotate-180' : ''
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* 관리자 서브메뉴 */}
                    {mobileAdminOpen && (
                      <div className="mt-2 ml-4 space-y-1">
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-600 transition-all duration-200 rounded-lg dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          통계
                        </Link>
                        <Link
                          to="/admin/scenarios"
                          className="block px-4 py-2 text-sm text-gray-600 transition-all duration-200 rounded-lg dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          훈련 시나리오 관리
                        </Link>
                        <Link
                          to="/admin/users"
                          className="block px-4 py-2 text-sm text-gray-600 transition-all duration-200 rounded-lg dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          이용자 관리
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* 헤더가 고정될 때 콘텐츠 점프 방지를 위한 공간 확보 */}
      {isScrolled && <div className="h-16" />}
    </>
  );
};

export default Header;
