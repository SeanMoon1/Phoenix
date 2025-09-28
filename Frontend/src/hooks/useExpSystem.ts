// src/hooks/useExpSystem.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getEXPForNextLevel, animateValue, getLevelUpBonus } from '@/utils/exp';

interface PersistState {
  EXP: number;
  level: number;
  streak: number;
  totalCorrect: number;
}

interface UseExpSystemProps {
  persistKey: string;
  userId?: number | null;
}

interface UseExpSystemReturn {
  // 상태
  EXP: number;
  level: number;
  totalCorrect: number;
  EXPDisplay: number;
  neededEXP: number;
  progressPct: number;
  hideExpFill: boolean;
  showLevelUp: boolean;
  levelUpBonus: number;

  // 액션
  awardExp: (amount: number) => void;
  incrementTotalCorrect: () => void;

  // 세터들
  setEXP: (value: number) => void;
  setLevel: (value: number) => void;
  setTotalCorrect: (value: number) => void;
  setEXPDisplay: (value: number) => void;
  setHideExpFill: (value: boolean) => void;
  setShowLevelUp: (value: boolean) => void;
  setLevelUpBonus: (value: number) => void;
}

export function useExpSystem({
  persistKey,
  userId,
}: UseExpSystemProps): UseExpSystemReturn {
  // 경험치 상태
  const [EXP, setEXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [EXPDisplay, setEXPDisplay] = useState(0);
  const [hideExpFill, setHideExpFill] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpBonus, setLevelUpBonus] = useState(0);

  // 계산된 값들
  const neededEXP = useMemo(() => getEXPForNextLevel(level), [level]);
  const progressPct = useMemo(() => {
    const pct = Math.min(100, Math.round((EXPDisplay / neededEXP) * 100));
    return Number.isFinite(pct) ? pct : 0;
  }, [EXPDisplay, neededEXP]);

  // 로컬 스토리지 복구 및 서버 데이터 동기화
  useEffect(() => {
    // 사용자 ID가 없으면 기본값으로 초기화
    if (!userId) {
      setEXP(0);
      setLevel(1);
      setTotalCorrect(0);
      setEXPDisplay(0);
      return;
    }

    // 서버에서 최신 사용자 정보 가져오기
    const loadServerData = async () => {
      try {
        const { userExpApi } = await import('@/services/api');
        const response = await userExpApi.getUserExpInfo(userId);

        if (response.success && response.data) {
          console.log('🔄 서버에서 사용자 경험치 정보 로드:', response.data);
          setEXP((response.data as any).userExp);
          setLevel((response.data as any).userLevel);
          setEXPDisplay((response.data as any).userExp);
          // totalCorrect는 서버에서 제공하지 않으므로 로컬 스토리지에서 가져오기
          const userSpecificKey = `${persistKey}_user_${userId}`;
          const raw = localStorage.getItem(userSpecificKey);
          if (raw) {
            try {
              const s: PersistState = JSON.parse(raw);
              setTotalCorrect(s.totalCorrect ?? 0);
            } catch {
              setTotalCorrect(0);
            }
          }
          return; // 서버 데이터 사용
        }
      } catch (error) {
        console.error('❌ 서버에서 사용자 경험치 정보 로드 실패:', error);
      }

      // 서버 데이터 로드 실패 시 로컬 스토리지에서 복구
      const userSpecificKey = `${persistKey}_user_${userId}`;
      const raw = localStorage.getItem(userSpecificKey);
      if (raw) {
        try {
          const s: PersistState = JSON.parse(raw);
          setEXP(s.EXP ?? 0);
          setLevel(s.level ?? 1);
          setTotalCorrect(s.totalCorrect ?? 0);
          setEXPDisplay(s.EXP ?? 0);
        } catch {
          /* ignore */
        }
      } else {
        // 사용자별 데이터가 없으면 기본값으로 초기화
        setEXP(0);
        setLevel(1);
        setTotalCorrect(0);
        setEXPDisplay(0);
      }
    };

    loadServerData();
  }, [persistKey, userId]);

  // 로컬 스토리지 저장
  useEffect(() => {
    // 사용자 ID가 없으면 저장하지 않음
    if (!userId) return;

    const userSpecificKey = `${persistKey}_user_${userId}`;
    const s: PersistState = { EXP, level, streak: 0, totalCorrect };
    localStorage.setItem(userSpecificKey, JSON.stringify(s));
  }, [EXP, level, totalCorrect, persistKey, userId]);

  // EXP 지급 함수
  const awardExp = useCallback(
    (amount: number) => {
      // 사용자 ID가 없으면 경험치를 지급하지 않음
      if (!userId) return;

      const oldLevel = level;
      const oldNeeded = getEXPForNextLevel(oldLevel);

      let nextEXP = EXP + amount;
      let nextLevel = level;
      let totalBonus = 0;
      let leveled = false;

      // 연쇄 레벨업 포함 계산
      while (nextEXP >= getEXPForNextLevel(nextLevel)) {
        nextEXP -= getEXPForNextLevel(nextLevel);
        nextLevel += 1;
        const bonus = getLevelUpBonus(nextLevel);
        totalBonus += bonus;
        nextEXP += bonus;
        leveled = true;
      }

      if (!leveled) {
        animateValue({
          from: EXPDisplay,
          to: nextEXP,
          duration: 600,
          onUpdate: setEXPDisplay,
        });
        setEXP(nextEXP);
        setLevel(nextLevel);
      } else {
        animateValue({
          from: EXPDisplay,
          to: oldNeeded,
          duration: 500,
          onUpdate: setEXPDisplay,
          onComplete: () => {
            setLevelUpBonus(totalBonus);
            setShowLevelUp(true);

            window.setTimeout(() => {
              setShowLevelUp(false);
              setLevel(nextLevel);
              setEXP(nextEXP);
              setHideExpFill(true);
              setEXPDisplay(0);

              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setHideExpFill(false);
                  animateValue({
                    from: 0,
                    to: nextEXP,
                    duration: 600,
                    onUpdate: setEXPDisplay,
                  });
                });
              });
            }, 500);
          },
        });
      }
    },
    [EXP, level, EXPDisplay, userId]
  );

  // 정답 수 증가
  const incrementTotalCorrect = useCallback(() => {
    // 사용자 ID가 없으면 정답 수를 증가시키지 않음
    if (!userId) return;
    setTotalCorrect(c => c + 1);
  }, [userId]);

  return {
    // 상태
    EXP,
    level,
    totalCorrect,
    EXPDisplay,
    neededEXP,
    progressPct,
    hideExpFill,
    showLevelUp,
    levelUpBonus,

    // 액션
    awardExp,
    incrementTotalCorrect,

    // 세터들
    setEXP,
    setLevel,
    setTotalCorrect,
    setEXPDisplay,
    setHideExpFill,
    setShowLevelUp,
    setLevelUpBonus,
  };
}
