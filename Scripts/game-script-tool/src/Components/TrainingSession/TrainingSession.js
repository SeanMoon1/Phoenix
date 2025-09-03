import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { APPROVAL_STATUS } from "../ScriptInput/constant";
import { calculateTrainingScore } from "../../Utils/scoreCalculator";

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

const ScenarioCard = styled.div`
  background: white;
  border: 2px solid #007bff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ScenarioInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const InfoItem = styled.div`
  text-align: center;
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const Timer = styled.div`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => {
    if (props.timeLeft <= 10) return "#dc3545";
    if (props.timeLeft <= 30) return "#ffc107";
    return "#28a745";
  }};
  margin: 20px 0;
`;

const ScenarioText = styled.div`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OptionButton = styled.button`
  padding: 15px 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  font-size: 16px;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: #007bff;
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.selected {
    border-color: #007bff;
    background: #e3f2fd;
  }
`;

const OptionText = styled.span`
  flex: 1;
`;

const OptionScore = styled.span`
  font-size: 12px;
  color: #666;
  margin-left: 10px;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const NavButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &.primary {
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  }

  &.secondary {
    background-color: #6c757d;
    color: white;
    &:hover {
      background-color: #545b62;
    }
  }

  &.success {
    background-color: #28a745;
    color: white;
    &:hover {
      background-color: #1e7e34;
    }
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin: 20px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #007bff;
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

const TrainingSession = ({ blockList, onTrainingComplete, currentUser }) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [trainingStartTime, setTrainingStartTime] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // 승인된 시나리오만 필터링
  const approvedScenarios = blockList.filter(
    (block) =>
      block.approvalStatus === APPROVAL_STATUS.APPROVED &&
      block.sceneType !== "ending"
  );

  const currentScenario = approvedScenarios[currentScenarioIndex];
  const progress =
    ((currentScenarioIndex + 1) / approvedScenarios.length) * 100;

  useEffect(() => {
    if (isTrainingActive && currentScenario) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentScenarioIndex, isTrainingActive]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpent((prev) => ({
        ...prev,
        [currentScenario.sceneId]: elapsed,
      }));
    }, 1000);
  };

  const startTraining = () => {
    setIsTrainingActive(true);
    setTrainingStartTime(Date.now());
    setCurrentScenarioIndex(0);
    setSelectedOptions({});
    setTimeSpent({});
  };

  const handleOptionSelect = (optionIndex) => {
    if (!isTrainingActive) return;

    setSelectedOptions((prev) => ({
      ...prev,
      [currentScenario.sceneId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentScenarioIndex < approvedScenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
    } else {
      completeTraining();
    }
  };

  const handlePrevious = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex((prev) => prev - 1);
    }
  };

  const completeTraining = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 훈련 결과 계산
    const userChoices = Object.keys(selectedOptions).map((sceneId) => ({
      sceneId,
      selectedOptionIndex: selectedOptions[sceneId],
      timeSpent: timeSpent[sceneId] || 0,
    }));

    const trainingResult = calculateTrainingScore(
      userChoices,
      approvedScenarios
    );

    // 훈련 완료 콜백 호출
    if (onTrainingComplete) {
      onTrainingComplete({
        ...trainingResult,
        totalTime: Date.now() - trainingStartTime,
        completedAt: new Date().toISOString(),
        userId: currentUser?.id || "anonymous",
        userName: currentUser?.name || "익명",
      });
    }

    setIsTrainingActive(false);
  };

  if (approvedScenarios.length === 0) {
    return (
      <Container>
        <Header>
          <Title>🚫 훈련 가능한 시나리오가 없습니다</Title>
          <Subtitle>승인된 시나리오가 필요합니다.</Subtitle>
        </Header>
      </Container>
    );
  }

  if (!isTrainingActive) {
    return (
      <Container>
        <Header>
          <Title>🎯 재난 대응 훈련</Title>
          <Subtitle>승인된 시나리오를 통해 훈련을 진행합니다</Subtitle>
        </Header>

        <ScenarioCard>
          <h3>📋 훈련 정보</h3>
          <div style={{ marginBottom: "20px" }}>
            <p>
              <strong>총 시나리오:</strong> {approvedScenarios.length}개
            </p>
            <p>
              <strong>예상 소요 시간:</strong> 약{" "}
              {Math.ceil(approvedScenarios.length * 2)}분
            </p>
          </div>

          <NavButton className="primary" onClick={startTraining}>
            🚀 훈련 시작
          </NavButton>
        </ScenarioCard>
      </Container>
    );
  }

  if (!currentScenario) {
    return (
      <Container>
        <Header>
          <Title>✅ 훈련 완료!</Title>
        </Header>
      </Container>
    );
  }

  const currentTimeSpent = timeSpent[currentScenario.sceneId] || 0;
  const timeLeft = Math.max(
    0,
    (currentScenario.timeLimit || 60) - currentTimeSpent
  );
  const isTimeUp = timeLeft <= 0;
  const hasSelection = selectedOptions[currentScenario.sceneId] !== undefined;

  return (
    <Container>
      <Header>
        <Title>🎯 재난 대응 훈련 진행 중</Title>
        <Subtitle>
          시나리오 {currentScenarioIndex + 1} / {approvedScenarios.length}
        </Subtitle>
      </Header>

      {/* 진행률 표시 */}
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>

      <ScenarioCard>
        {/* 시나리오 정보 */}
        <ScenarioInfo>
          <InfoItem>
            <InfoLabel>재난 유형</InfoLabel>
            <InfoValue>
              {currentScenario.disasterType === "fire" && "🔥 화재"}
              {currentScenario.disasterType === "earthquake" && "🌋 지진"}
              {currentScenario.disasterType === "emergency" && "🚑 응급처치"}
              {currentScenario.disasterType === "flood" && "🌊 침수/홍수"}
              {currentScenario.disasterType === "complex" && "⚡ 복합 재난"}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>난이도</InfoLabel>
            <InfoValue>
              {currentScenario.difficulty === "easy" && "🟢 쉬움"}
              {currentScenario.difficulty === "medium" && "🟡 보통"}
              {currentScenario.difficulty === "hard" && "🔴 어려움"}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>제한 시간</InfoLabel>
            <InfoValue>{currentScenario.timeLimit || 60}초</InfoValue>
          </InfoItem>
        </ScenarioInfo>

        {/* 타이머 */}
        <Timer timeLeft={timeLeft}>
          ⏱️ {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </Timer>

        {/* 시나리오 설명 */}
        <ScenarioText>{currentScenario.sceneScript}</ScenarioText>

        {/* 선택지 */}
        <OptionsContainer>
          {currentScenario.options.map((option, index) => (
            <OptionButton
              key={index}
              onClick={() => handleOptionSelect(index)}
              className={
                selectedOptions[currentScenario.sceneId] === index
                  ? "selected"
                  : ""
              }
              disabled={isTimeUp || hasSelection}
            >
              <OptionText>{option.answer}</OptionText>
              <OptionScore>
                🏃‍♂️{option.points?.speed || 0} 🎯{option.points?.accuracy || 0}
              </OptionScore>
            </OptionButton>
          ))}
        </OptionsContainer>

        {/* 시간 초과 시 자동 진행 */}
        {isTimeUp && !hasSelection && (
          <div
            style={{
              textAlign: "center",
              margin: "20px 0",
              padding: "15px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "8px",
              color: "#856404",
            }}
          >
            ⏰ 시간이 초과되었습니다. 자동으로 다음으로 진행됩니다.
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <NavigationButtons>
          <NavButton
            className="secondary"
            onClick={handlePrevious}
            disabled={currentScenarioIndex === 0}
          >
            ⬅️ 이전
          </NavButton>

          <NavButton
            className={
              currentScenarioIndex === approvedScenarios.length - 1
                ? "success"
                : "primary"
            }
            onClick={handleNext}
            disabled={!hasSelection && !isTimeUp}
          >
            {currentScenarioIndex === approvedScenarios.length - 1
              ? "🏁 훈련 완료"
              : "다음 ➡️"}
          </NavButton>
        </NavigationButtons>
      </ScenarioCard>
    </Container>
  );
};

export default TrainingSession;
