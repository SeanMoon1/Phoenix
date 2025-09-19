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

  // 엔딩 모달 처리 - sceneId만 체크하여 무한 루프 방지
  useEffect(() => {
    console.log('🔄 useModals useEffect 실행됨');
    
    const sceneId = scenario?.sceneId;
    const isEndScene = sceneId ? sceneId.trim() === END_SCENE_ID : false;

    console.log('🔍 useModals 엔딩 체크:', {
      hasScenario: !!scenario,
      sceneId,
      endModalAutoShown,
      isEndScene,
      failedThisRun,
      scenarioTitle: scenario?.title,
      scenarioContent: scenario?.content?.substring(0, 50) + '...',
    });

    // 각 조건을 개별적으로 체크하여 어느 조건에서 막히는지 확인
    if (!scenario) {
      console.log('❌ useModals: scenario가 없음', {
        hasScenario: !!scenario,
        scenarioValue: scenario,
        // useModals가 받은 props들을 확인하기 위해 추가 로깅
        props: {
          scenario,
          failedThisRun,
          scenarioSetName,
          endModalAutoShown,
        },
      });
      return;
    }

    if (endModalAutoShown) {
      console.log('❌ useModals: endModalAutoShown이 이미 true');
      return;
    }

    if (!isEndScene) {
      console.log('❌ useModals: isEndScene이 false - 엔딩 씬이 아님', {
        sceneId,
        END_SCENE_ID,
        trimmedSceneId: sceneId?.trim(),
        isMatch: sceneId?.trim() === END_SCENE_ID,
      });
      return;
    }

    console.log('✅ useModals: 모든 조건 통과 - 훈련 완료 처리 시작');

    console.log('🎯 useModals: 훈련 완료! 결과 저장 시작');
    console.log('🔍 useModals 상세 정보:', {
      scenarioTitle: scenario?.title,
      scenarioSceneId: scenario?.sceneId,
      endModalAutoShown,
      isEndScene,
      failedThisRun,
      scenarioSetName,
    });

    setEndModalAutoShown(true);

    // onSaveResult 함수 호출 전 로깅
    console.log('🚀 onSaveResult 함수 호출 시도:', typeof onSaveResult);
    console.log('🔍 onSaveResult 함수 상세:', {
      isFunction: typeof onSaveResult === 'function',
      functionName: onSaveResult?.name,
      functionLength: onSaveResult?.length,
    });

    if (typeof onSaveResult === 'function') {
      console.log('✅ onSaveResult 함수 호출 시작');
      onSaveResult()
        .then(() => {
          console.log('✅ onSaveResult 함수 호출 성공');
        })
        .catch(err => {
          console.error('❌ [useModals] onSaveResult failed', err);
        });
    } else {
      console.error('❌ onSaveResult가 함수가 아닙니다:', onSaveResult);
    }

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
  }, [
    scenario?.sceneId, // sceneId만 의존성으로 사용
    endModalAutoShown,
    failedThisRun,
    scenarioSetName,
    // setEndModalAutoShown과 onSaveResult를 의존성 배열에서 제거하여 무한 루프 방지
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
