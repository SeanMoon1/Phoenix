// src/hooks/useModals.ts
import { useState, useEffect } from 'react';
import type { Scenario } from '@/types';

const END_SCENE_ID = '#END';

interface UseModalsProps {
  scenario: Scenario | null;
  failedThisRun: boolean;
  scenarioSetName: string;
  endModalAutoShown: boolean;
  setEndModalAutoShown: (value: boolean) => void;
  onSaveResult: () => Promise<void>;
}

interface UseModalsReturn {
  // 모달 상태
  clearMsg: string | null;
  failMsg: string | null;
  showConfetti: boolean;

  // 화면 크기
  vw: number;
  vh: number;

  // 액션
  setClearMsg: (value: string | null) => void;
  setFailMsg: (value: string | null) => void;
  setShowConfetti: (value: boolean) => void;
}

export function useModals({
  scenario,
  failedThisRun,
  scenarioSetName,
  endModalAutoShown,
  setEndModalAutoShown,
  onSaveResult,
}: UseModalsProps): UseModalsReturn {
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

  // 엔딩 모달 처리
  useEffect(() => {
    console.log('🔍 useModals 엔딩 체크:', {
      hasScenario: !!scenario,
      sceneId: scenario?.sceneId,
      endModalAutoShown,
      isEndScene: scenario
        ? (scenario.sceneId ?? '').trim() === END_SCENE_ID
        : false,
      failedThisRun,
    });

    if (!scenario || endModalAutoShown) return;
    if ((scenario.sceneId ?? '').trim() === END_SCENE_ID) {
      console.log('🎯 useModals: 훈련 완료! 결과 저장 시작');
      setEndModalAutoShown(true);
      // onSaveResult는 비동기지만 에러를 흘리지 않도록 처리
      onSaveResult().catch(err =>
        console.error('[useModals] onSaveResult failed', err)
      );

      if (!failedThisRun) {
        _setClearMsg(
          `축하합니다! ${scenarioSetName} 시나리오를 모두 클리어하였습니다.`
        );
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4500);
      } else {
        _setFailMsg(
          `${scenarioSetName} 시나리오를 클리어하지 못했습니다. 다시 도전해보세요!`
        );
      }
    }
  }, [
    scenario,
    endModalAutoShown,
    failedThisRun,
    scenarioSetName,
    setEndModalAutoShown,
    onSaveResult,
  ]);

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

  const setClearMsg = (msg: string | null) => {
    _setClearMsg(msg); // if you rename internal setter, else use existing setClearMsg
  };
  const setFailMsg = (msg: string | null) => {
    _setFailMsg(msg);
  };

  return {
    // 모달 상태
    clearMsg: _clearMsg,
    failMsg: _failMsg,
    showConfetti,

    // 화면 크기
    vw,
    vh,

    // 액션
    setClearMsg,
    setFailMsg,
    setShowConfetti,
  };
}
