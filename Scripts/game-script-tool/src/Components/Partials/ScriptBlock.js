/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import styled from "styled-components";
import { APPROVAL_STATUS_INFO } from "../ScriptInput/constant";

const Anchor = styled.a`
  color: inherit;
  text-decoration: none;
`;

const Red = styled(Anchor)`
  color: red;
  font-weight: bolder;
`;

const Container = styled.div`
  background-color: #efefef;
  padding: 10px;
  margin: 5px;
  position: relative;
`;

const SceneID = styled.div`
  font-weight: 800;
  cursor: pointer;
  & small {
    font-weight: 400;
    cursor: default;
    margin-left: 8px;
  }
`;

// ✅ 재난 정보 스타일 추가
const DisasterInfo = styled.div`
  margin-top: 5px;
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

// ✅ 승인 상태 표시 스타일
const ApprovalStatus = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  color: white;
  background-color: ${(props) => props.color};
`;

const CreatorInfo = styled.div`
  font-size: 11px;
  color: #666;
  text-align: right;
`;

const SceneScript = styled.div`
  margin-top: 5px;
  background-color: white;
  padding: 5px;
  border-radius: 3px;
`;

const OptionGroup = styled.ol``;
const OptionItem = styled.li``;

// ✅ 점수 표시 스타일
const ScoreInfo = styled.div`
  margin-top: 5px;
  font-size: 12px;
  color: #555;
  background-color: #f8f8f8;
  padding: 5px;
  border-radius: 3px;
`;

const ScoreItem = styled.span`
  margin-right: 15px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const FileDescription = styled.span`
  margin-right: 10px;
  font-size: 13px;
`;

const Script = styled.span`
  background-color: ${(props) => (props.color ? props.color : "white")};
  border-radius: 5px;
  padding: 3px;
  display: inline-block;
`;

const MenuGroup = styled.ul`
  margin: 0px;
  padding: 0px;
  list-style: none;
  position: absolute;
  right: 5px;
  top: 5px;
  display: flex;
`;

const MenuItem = styled.li`
  font-size: 12px;
  margin-left: 6px;
  cursor: pointer;
  &:hover {
    font-weight: bolder;
  }
`;

const ScriptBlock = (props) => {
  const { block, moveBlockBy, removeBlock, modifyBlock, blockList } = props;

  const onRemoveClick = () => {
    removeBlock(block.sceneId);
  };

  const onModifyClick = () => {
    modifyBlock(block.sceneId);
  };

  const alertMessage = (message) => (e) => {
    alert(message);
  };

  // ✅ 재난 유형별 이모지 및 한글명
  const getDisasterTypeInfo = (type) => {
    const typeMap = {
      fire: { emoji: "🔥", name: "화재" },
      earthquake: { emoji: "🌋", name: "지진" },
      emergency: { emoji: "🚑", name: "응급처치" },
      flood: { emoji: "🌊", name: "침수/홍수" },
      complex: { emoji: "⚡", name: "복합 재난" },
    };
    return typeMap[type] || { emoji: "❓", name: "알 수 없음" };
  };

  // ✅ 난이도별 이모지 및 한글명
  const getDifficultyInfo = (difficulty) => {
    const difficultyMap = {
      easy: { emoji: "🟢", name: "쉬움" },
      medium: { emoji: "🟡", name: "보통" },
      hard: { emoji: "🔴", name: "어려움" },
    };
    return difficultyMap[difficulty] || { emoji: "❓", name: "알 수 없음" };
  };

  // ✅ 시나리오 타입별 이모지 및 한글명
  const getSceneTypeInfo = (type) => {
    const typeMap = {
      disaster: { emoji: "🚨", name: "재난 상황" },
      training: { emoji: "🎯", name: "훈련 진행" },
      ending: { emoji: "🏁", name: "훈련 결과" },
    };
    return typeMap[type] || { emoji: "❓", name: "알 수 없음" };
  };

  const disasterTypeInfo = getDisasterTypeInfo(block.disasterType);
  const difficultyInfo = getDifficultyInfo(block.difficulty);
  const sceneTypeInfo = getSceneTypeInfo(block.sceneType);

  return (
    <Container id={block.sceneId}>
      {/* ✅ 승인 상태 표시 */}
      <ApprovalStatus>
        <StatusBadge color={APPROVAL_STATUS_INFO[block.approvalStatus]?.color}>
          {APPROVAL_STATUS_INFO[block.approvalStatus]?.emoji}
          {APPROVAL_STATUS_INFO[block.approvalStatus]?.name}
        </StatusBadge>
        <CreatorInfo>
          <div>👤 {block.createdBy || "익명"}</div>
          <div>
            📅{" "}
            {block.createdAt
              ? new Date(block.createdAt).toLocaleDateString()
              : "날짜 없음"}
          </div>
        </CreatorInfo>
      </ApprovalStatus>

      <MenuGroup>
        <MenuItem onClick={() => moveBlockBy(block.sceneId, -1)}>위로</MenuItem>
        <MenuItem onClick={() => moveBlockBy(block.sceneId, 1)}>
          아래로
        </MenuItem>
        <MenuItem onClick={onRemoveClick}>삭제</MenuItem>
        <MenuItem onClick={onModifyClick}>수정</MenuItem>
      </MenuGroup>

      <Anchor href={`#${block.sceneId}`}>
        <SceneID>
          {block.sceneId}{" "}
          <small>
            {sceneTypeInfo.emoji}
            {sceneTypeInfo.name}
          </small>
        </SceneID>
      </Anchor>

      {/* ✅ 재난 정보 표시 */}
      {block.sceneType !== "ending" && (
        <DisasterInfo>
          <InfoItem>
            {disasterTypeInfo.emoji} {disasterTypeInfo.name}
          </InfoItem>
          <InfoItem>
            {difficultyInfo.emoji} {difficultyInfo.name}
          </InfoItem>
          <InfoItem>⏱️ {block.timeLimit || 60}초</InfoItem>
        </DisasterInfo>
      )}

      <SceneScript>{block.sceneScript}</SceneScript>

      {/* ✅ 주석 처리된 필드들 (나중에 사용 가능) */}
      {block.sceneType !== "ending" &&
        block.backgroundImage &&
        block.backgroundImage.length > 0 && (
          <FileDescription aria-label="landscape">
            🏞️ 배경이미지 <b>"{block.backgroundImage}"</b>
            <small style={{ color: "gray" }}> (주석 처리됨)</small>
          </FileDescription>
        )}
      {block.sceneType !== "ending" &&
        block.sceneSound &&
        block.sceneSound.length > 0 && (
          <FileDescription aria-label="speaker">
            🔈 상황음향 <b>"{block.sceneSound}"</b>
            <small style={{ color: "gray" }}> (주석 처리됨)</small>
          </FileDescription>
        )}

      {/* ✅ 선택지 및 점수 시스템 */}
      {block.sceneType !== "ending" && (
        <>
          {block.options.length === 0 ? (
            <div>다음 시나리오 ID : {block.nextSceneId}</div>
          ) : (
            <OptionGroup>
              {block.options.map(({ answer, reaction, nextId, points }, i) => (
                <OptionItem key={i}>
                  {answer?.length > 0 ? (
                    <>
                      <Script color="lightcyan">{answer}</Script> 선택 시
                    </>
                  ) : null}
                  {answer?.length > 0 ? " → " : null}
                  {reaction?.length > 0 ? (
                    <>
                      <Script color="lightyellow">{reaction}</Script> 결과
                    </>
                  ) : null}
                  {reaction?.length > 0 ? " → " : null}
                  {blockList.findIndex((block) => block.sceneId === nextId) ===
                  -1 ? (
                    <Red
                      href="#"
                      onClick={alertMessage(
                        "존재하지 않는 시나리오 ID 입니다."
                      )}
                    >
                      {nextId}
                    </Red>
                  ) : (
                    <Anchor href={`#${nextId}`}>
                      <b>{nextId}</b>
                    </Anchor>
                  )}{" "}
                  시나리오 이동
                  {/* ✅ 점수 정보 표시 */}
                  {points && (
                    <ScoreInfo>
                      <ScoreItem>
                        🏃‍♂️ 신속성: <b>{points.speed || 0}점</b>
                      </ScoreItem>
                      <ScoreItem>
                        🎯 정확성: <b>{points.accuracy || 0}점</b>
                      </ScoreItem>
                      {/* ❌ 협업 점수 제거 - 싱글 플레이 불필요 */}
                    </ScoreInfo>
                  )}
                </OptionItem>
              ))}
            </OptionGroup>
          )}
        </>
      )}
    </Container>
  );
};

export default ScriptBlock;
