// src/hooks/useModals.ts
import { useState, useEffect } from 'react';
import type { Scenario } from '@/types';

interface UseModalsProps {
  scenario?: Scenario | null;
  failedThisRun?: boolean;
  scenarioSetName?: string;
  endModalAutoShown?: boolean;
  setEndModalAutoShown?: (value: boolean) => void;
  onSaveResult?: () => Promise<void>;
  currentIndex?: number;
  scenariosCount?: number;
}

interface UseModalsReturn {
  clearMsg: string | null;
  failMsg: string | null;
  showConfetti: boolean;
  vw: number;
  vh: number;
  setClearMsg: (value: string | null) => void;
  setFailMsg: (value: string | null) => void;
  setShowConfetti: (value: boolean) => void;
}

export function useModals(opts?: Partial<UseModalsProps>): UseModalsReturn {
  const {
    scenario,
    failedThisRun,
    scenarioSetName,
    endModalAutoShown,
    setEndModalAutoShown,
    onSaveResult,
    currentIndex,
    scenariosCount,
  } = opts ?? {};

  // 모달 상태
  const [_clearMsg, _setClearMsg] = useState<string | null>(null);
  const [_failMsg, _setFailMsg] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // 화면 크기
  const [vw, setVw] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [vh, setVh] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  // 화면 크기 리사이즈
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 모달 시 스크롤 잠금
  useEffect(() => {
    const lock = _clearMsg || _failMsg || showConfetti;
    const { body, documentElement: html } = document;
    if (lock) {
      const prevBodyOverflow = body.style.overflow;
      const prevHtmlOverflowX = html.style.overflowX;
      body.style.overflow = 'hidden';
      html.style.overflowX = 'hidden';
      return () => {
        body.style.overflow = prevBodyOverflow;
        html.style.overflowX = prevHtmlOverflowX;
      };
    }
  }, [_clearMsg, _failMsg, showConfetti]);

  // 엔딩 판정 및 모달 표시
  useEffect(() => {
    // don't run until we have scenario list info
    if (typeof scenariosCount !== 'number' || scenariosCount <= 0) return;
    // require either a valid scenario object or a numeric currentIndex
    if (!scenario && typeof currentIndex !== 'number') return;
    if (endModalAutoShown || _clearMsg || _failMsg) return;

    // 엔딩 판정: 씬 ID가 #END 이거나 (현재 인덱스가 마지막 인덱스일 때)
    const isBySceneId =
      !!scenario && (scenario.sceneId ?? '').trim() === END_SCENE_ID;
    const isByIndex =
      typeof currentIndex === 'number' && currentIndex >= scenariosCount - 1;

    if (!isBySceneId && !isByIndex) return;

    // 플래그 설정(호출자에 의해 전달된 setter가 있으면 설정)
    setEndModalAutoShown?.(true);

    // 결과 저장 호출(있으면 비동기 호출)
    if (onSaveResult) {
      onSaveResult().catch(err => {
        console.error('useModals.onSaveResult failed', err);
      });
    }

    // 모달 메시지 설정
    if (failedThisRun) {
      _setFailMsg(
        `${scenarioSetName ?? '훈련'} 훈련에 실패했습니다. 다시 도전해보세요!`
      );
    } else {
      _setClearMsg(`${scenarioSetName ?? '훈련'} 훈련 완료!\n축하합니다!`);
      setShowConfetti(true);
      // optional: turn off confetti after a while
      setTimeout(() => setShowConfetti(false), 4500);
    }
  }, [
    scenario,
    currentIndex,
    scenariosCount,
    endModalAutoShown,
    failedThisRun,
    _clearMsg,
    _failMsg,
    scenarioSetName,
    onSaveResult,
    setEndModalAutoShown,
  ]);

  const setClearMsg = (msg: string | null) => _setClearMsg(msg);
  const setFailMsg = (msg: string | null) => _setFailMsg(msg);

  return {
    clearMsg: _clearMsg,
    failMsg: _failMsg,
    showConfetti,
    vw,
    vh,
    setClearMsg,
    setFailMsg,
    setShowConfetti: setShowConfetti,
  };
}
