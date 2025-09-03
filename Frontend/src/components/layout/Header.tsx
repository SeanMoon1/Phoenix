import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 각 드롭다운 상태 관리
  const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(false);
  const [isTrainingScenariosDropdownOpen, setIsTrainingScenariosDropdownOpen] =
    useState(false);
  const [isAnalysisDropdownOpen, setIsAnalysisDropdownOpen] = useState(false);
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);

  // 모바일 서브메뉴 상태 관리
  const [mobileMembersOpen, setMobileMembersOpen] = useState(false);
  const [mobileTrainingOpen, setMobileTrainingOpen] = useState(false);
  const [mobileAnalysisOpen, setMobileAnalysisOpen] = useState(false);
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);

  // 각 드롭다운 ref
  const membersDropdownRef = useRef<HTMLDivElement>(null);
  const trainingScenariosDropdownRef = useRef<HTMLDivElement>(null);
  const analysisDropdownRef = useRef<HTMLDivElement>(null);
  const supportDropdownRef = useRef<HTMLDivElement>(null);

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

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refs = [
        membersDropdownRef,
        trainingScenariosDropdownRef,
        analysisDropdownRef,
        supportDropdownRef,
      ];
      const isOutside = refs.every(
        ref => !ref.current || !ref.current.contains(event.target as Node)
      );

      if (isOutside) {
        setIsMembersDropdownOpen(false);
        setIsTrainingScenariosDropdownOpen(false);
        setIsAnalysisDropdownOpen(false);
        setIsSupportDropdownOpen(false);
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
      setMobileMembersOpen(false);
      setMobileTrainingOpen(false);
      setMobileAnalysisOpen(false);
      setMobileSupportOpen(false);
    }
  };

  // 드롭다운 토글 함수들
  const toggleMembersDropdown = () => {
    console.log('회원 드롭다운 토글:', !isMembersDropdownOpen);
    setIsMembersDropdownOpen(!isMembersDropdownOpen);
    setIsTrainingScenariosDropdownOpen(false);
    setIsAnalysisDropdownOpen(false);
    setIsSupportDropdownOpen(false);
  };

  const toggleTrainingScenariosDropdown = () => {
    console.log(
      '훈련시나리오 드롭다운 토글:',
      !isTrainingScenariosDropdownOpen
    );
    setIsTrainingScenariosDropdownOpen(!isTrainingScenariosDropdownOpen);
    setIsMembersDropdownOpen(false);
    setIsAnalysisDropdownOpen(false);
    setIsSupportDropdownOpen(false);
  };

  const toggleAnalysisDropdown = () => {
    console.log('결과분석 드롭다운 토글:', !isAnalysisDropdownOpen);
    setIsAnalysisDropdownOpen(!isAnalysisDropdownOpen);
    setIsMembersDropdownOpen(false);
    setIsTrainingScenariosDropdownOpen(false);
    setIsSupportDropdownOpen(false);
  };

  const toggleSupportDropdown = () => {
    console.log('고객지원 드롭다운 토글:', !isSupportDropdownOpen);
    setIsSupportDropdownOpen(!isSupportDropdownOpen);
    setIsMembersDropdownOpen(false);
    setIsTrainingScenariosDropdownOpen(false);
    setIsAnalysisDropdownOpen(false);
  };

  // 모바일 서브메뉴 토글 함수들
  const toggleMobileMembers = () => setMobileMembersOpen(!mobileMembersOpen);
  const toggleMobileTraining = () => setMobileTrainingOpen(!mobileTrainingOpen);
  const toggleMobileAnalysis = () => setMobileAnalysisOpen(!mobileAnalysisOpen);
  const toggleMobileSupport = () => setMobileSupportOpen(!mobileSupportOpen);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 relative z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-red-400">
                재난훈련ON
              </span>
            </Link>
          </div>

          {/* 네비게이션 - 데스크톱 */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 relative">
            {/* 회원 드롭다운 */}
            <div className="relative" ref={membersDropdownRef}>
              <button
                onClick={toggleMembersDropdown}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-1 ${
                  isMembersDropdownOpen
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                <span>회원</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMembersDropdownOpen ? 'rotate-180' : ''
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

              {/* 회원 드롭다운 메뉴 */}
              {isMembersDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsMembersDropdownOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/mypage"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsMembersDropdownOpen(false)}
                  >
                    마이페이지
                  </Link>
                </div>
              )}
            </div>

            {/* 훈련시나리오 드롭다운 */}
            <div className="relative" ref={trainingScenariosDropdownRef}>
              <button
                onClick={toggleTrainingScenariosDropdown}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-1 ${
                  isTrainingScenariosDropdownOpen
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                <span>훈련시나리오</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isTrainingScenariosDropdownOpen ? 'rotate-180' : ''
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

              {/* 훈련시나리오 드롭다운 메뉴 */}
              {isTrainingScenariosDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    카테고리
                  </div>
                  <Link
                    to="/training/fire"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                    onClick={() => setIsTrainingScenariosDropdownOpen(false)}
                  >
                    화재 대응
                  </Link>
                  <Link
                    to="/training/earthquake"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                    onClick={() => setIsTrainingScenariosDropdownOpen(false)}
                  >
                    지진 대응
                  </Link>
                  <Link
                    to="/training/emergency"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                    onClick={() => setIsTrainingScenariosDropdownOpen(false)}
                  >
                    응급처치
                  </Link>
                  <Link
                    to="/training/flood"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                    onClick={() => setIsTrainingScenariosDropdownOpen(false)}
                  >
                    침수/홍수 대응
                  </Link>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mt-2">
                    훈련 진행
                  </div>
                  <Link
                    to="/training/progress"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                    onClick={() => setIsTrainingScenariosDropdownOpen(false)}
                  >
                    훈련 시작
                  </Link>
                </div>
              )}
            </div>

            {/* 결과분석 드롭다운 */}
            <div className="relative" ref={analysisDropdownRef}>
              <button
                onClick={toggleAnalysisDropdown}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-1 ${
                  isAnalysisDropdownOpen
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                <span>결과분석</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isAnalysisDropdownOpen ? 'rotate-180' : ''
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

              {/* 결과분석 드롭다운 메뉴 */}
              {isAnalysisDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                  <Link
                    to="/analysis/guide"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsAnalysisDropdownOpen(false)}
                  >
                    올바른 대응 방법 안내
                  </Link>
                  <Link
                    to="/analysis/compare"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsAnalysisDropdownOpen(false)}
                  >
                    내 선택 비교
                  </Link>
                  <Link
                    to="/analysis/recommend"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsAnalysisDropdownOpen(false)}
                  >
                    다음 훈련 추천
                  </Link>
                </div>
              )}
            </div>

            {/* 고객지원 드롭다운 */}
            <div className="relative" ref={supportDropdownRef}>
              <button
                onClick={toggleSupportDropdown}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-1 ${
                  isSupportDropdownOpen
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                <span>고객지원</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isSupportDropdownOpen ? 'rotate-180' : ''
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

              {/* 고객지원 드롭다운 메뉴 */}
              {isSupportDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]">
                  <Link
                    to="/faq"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsSupportDropdownOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsSupportDropdownOpen(false)}
                  >
                    문의하기
                  </Link>
                  <Link
                    to="/resources"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsSupportDropdownOpen(false)}
                  >
                    관련자료실
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* 우측 메뉴 (다크모드 토글, 사용자 메뉴) */}
          <div className="flex items-center space-x-3">
            {/* 다크모드 토글 버튼 */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
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
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}님
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400"
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
                    className="hidden sm:inline-flex border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    로그인
                  </Button>
                </Link>
              </div>
            )}

            {/* 모바일 햄버거 메뉴 버튼 */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
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
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="space-y-2">
              {/* 회원 섹션 */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  onClick={toggleMobileMembers}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 rounded-lg"
                >
                  <span>회원</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileMembersOpen ? 'rotate-180' : ''
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

                {/* 회원 서브메뉴 */}
                {mobileMembersOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link
                      to="/login"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link
                      to="/mypage"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      마이페이지
                    </Link>
                  </div>
                )}
              </div>

              {/* 훈련시나리오 섹션 */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  onClick={toggleMobileTraining}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 rounded-lg"
                >
                  <span>훈련시나리오</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileTrainingOpen ? 'rotate-180' : ''
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

                {/* 훈련시나리오 서브메뉴 */}
                {mobileTrainingOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      카테고리
                    </div>
                    <Link
                      to="/training/fire"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      화재 대응
                    </Link>
                    <Link
                      to="/training/earthquake"
                      className="block px-4 py-2 rounded-lg text-sm text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      지진 대응
                    </Link>
                    <Link
                      to="/training/emergency"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      응급처치
                    </Link>
                    <Link
                      to="/training/flood"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      침수/홍수 대응
                    </Link>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
                      훈련 진행
                    </div>
                    <Link
                      to="/training/progress"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      훈련 시작
                    </Link>
                  </div>
                )}
              </div>

              {/* 결과분석 섹션 */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  onClick={toggleMobileAnalysis}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 rounded-lg"
                >
                  <span>결과분석</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileAnalysisOpen ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.400z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* 결과분석 서브메뉴 */}
                {mobileAnalysisOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link
                      to="/analysis/guide"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      올바른 대응 방법 안내
                    </Link>
                    <Link
                      to="/analysis/compare"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      내 선택 비교
                    </Link>
                    <Link
                      to="/analysis/recommend"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      다음 훈련 추천
                    </Link>
                  </div>
                )}
              </div>

              {/* 고객지원 섹션 */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                  onClick={toggleMobileSupport}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 rounded-lg"
                >
                  <span>고객지원</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileSupportOpen ? 'rotate-180' : ''
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

                {/* 고객지원 서브메뉴 */}
                {mobileSupportOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link
                      to="/faq"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQ
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      문의하기
                    </Link>
                    <Link
                      to="/resources"
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      관련자료실
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
