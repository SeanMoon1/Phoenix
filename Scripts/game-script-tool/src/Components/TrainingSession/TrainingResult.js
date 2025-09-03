import React from "react";
import styled from "styled-components";
import { SCORE_GRADES } from "../ScriptInput/constant";

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

const ResultCard = styled.div`
  background: white;
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ScoreSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const TotalScore = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 10px;
`;

const GradeBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background: ${(props) => {
    switch (props.grade) {
      case "EXCELLENT":
        return "#28a745";
      case "GOOD":
        return "#17a2b8";
      case "AVERAGE":
        return "#ffc107";
      case "BELOW_AVERAGE":
        return "#fd7e14";
      case "POOR":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  }};
  color: white;
  border-radius: 20px;
  font-weight: bold;
  font-size: 18px;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ScoreItem = styled.div`
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

const ScoreLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const ScoreValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const FeedbackSection = styled.div`
  margin-bottom: 30px;
`;

const FeedbackTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FeedbackText = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const SuggestionItem = styled.li`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 12px 15px;
  margin-bottom: 10px;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChoiceDetails = styled.div`
  margin-bottom: 30px;
`;

const ChoiceTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChoiceItem = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
`;

const ChoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ChoiceScenario = styled.span`
  font-weight: bold;
  color: #333;
`;

const ChoiceScore = styled.span`
  font-size: 14px;
  color: #666;
`;

const ChoiceFeedback = styled.div`
  font-size: 14px;
  color: #666;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
`;

const ActionButton = styled.button`
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
`;

const TrainingResult = ({
  result,
  onRetry,
  onBackToScenarios,
  onViewDetails,
}) => {
  if (!result) return null;

  const {
    totalScore,
    speedScore,
    accuracyScore,
    grade,
    gradeInfo,
    overallFeedback,
    improvementSuggestions,
    choiceDetails,
    totalTime,
    completedAt,
    userName,
  } = result;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <Container>
      <Header>
        <Title>🏆 훈련 완료!</Title>
        <p>수고하셨습니다, {userName}님!</p>
      </Header>

      <ResultCard>
        {/* 총점 및 등급 */}
        <ScoreSection>
          <TotalScore>{totalScore}점</TotalScore>
          <GradeBadge grade={grade}>
            {gradeInfo?.emoji} {gradeInfo?.name}
          </GradeBadge>
        </ScoreSection>

        {/* 세부 점수 */}
        <ScoreGrid>
          <ScoreItem>
            <ScoreLabel>🏃‍♂️ 신속성 점수</ScoreLabel>
            <ScoreValue>{speedScore}점</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>🎯 정확성 점수</ScoreLabel>
            <ScoreValue>{accuracyScore}점</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>⏱️ 총 소요 시간</ScoreLabel>
            <ScoreValue>{formatTime(totalTime)}</ScoreValue>
          </ScoreItem>
          <ScoreItem>
            <ScoreLabel>📅 완료 일시</ScoreLabel>
            <ScoreValue>{new Date(completedAt).toLocaleString()}</ScoreValue>
          </ScoreItem>
        </ScoreGrid>

        {/* 전체 피드백 */}
        <FeedbackSection>
          <FeedbackTitle>💬 전체 평가</FeedbackTitle>
          <FeedbackText>{overallFeedback}</FeedbackText>
        </FeedbackSection>

        {/* 개선 제안 */}
        {improvementSuggestions && improvementSuggestions.length > 0 && (
          <FeedbackSection>
            <FeedbackTitle>💡 개선 제안</FeedbackTitle>
            <SuggestionsList>
              {improvementSuggestions.map((suggestion, index) => (
                <SuggestionItem key={index}>💡 {suggestion}</SuggestionItem>
              ))}
            </SuggestionsList>
          </FeedbackSection>
        )}

        {/* 선택별 상세 피드백 */}
        {choiceDetails && choiceDetails.length > 0 && (
          <ChoiceDetails>
            <ChoiceTitle>📋 선택별 상세 분석</ChoiceTitle>
            {choiceDetails.map((choice, index) => (
              <ChoiceItem key={index}>
                <ChoiceHeader>
                  <ChoiceScenario>시나리오 {choice.sceneId}</ChoiceScenario>
                  <ChoiceScore>
                    🏃‍♂️{choice.speedScore} 🎯{choice.accuracyScore}
                  </ChoiceScore>
                </ChoiceHeader>
                <ChoiceFeedback>{choice.feedback}</ChoiceFeedback>
              </ChoiceItem>
            ))}
          </ChoiceDetails>
        )}

        {/* 액션 버튼 */}
        <ActionButtons>
          <ActionButton className="secondary" onClick={onBackToScenarios}>
            📚 시나리오 관리로
          </ActionButton>
          <ActionButton className="success" onClick={onRetry}>
            🔄 다시 훈련하기
          </ActionButton>
          {onViewDetails && (
            <ActionButton className="primary" onClick={onViewDetails}>
              📊 상세 결과 보기
            </ActionButton>
          )}
        </ActionButtons>
      </ResultCard>
    </Container>
  );
};

export default TrainingResult;
