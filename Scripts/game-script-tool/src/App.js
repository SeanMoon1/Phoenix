import React, { useState } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import ControlMenu from "./Components/ControlMenu";
import ScriptInput from "./Components/ScriptInput";
import ScriptView from "./Components/ScriptView";
import ApprovalManager from "./Components/ApprovalManager/ApprovalManager";
import TrainingSession from "./Components/TrainingSession/TrainingSession";
import TrainingResult from "./Components/TrainingSession/TrainingResult";
import { appStateAtom } from "./Stores/atom";
import { blockListSelector } from "./Stores/selector";
import { USER_ROLES, APPROVAL_STATUS } from "./Components/ScriptInput/constant";

const Container = styled.div`
  @media (min-width: 800px) {
    width: 80%;
  }
  margin: auto auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const BlockContainer = styled.div`
  overflow-y: auto;
`;

const UserInfo = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 12px;
`;

const RoleBadge = styled.span`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background-color: ${(props) => {
    switch (props.role) {
      case USER_ROLES.ADMIN:
        return "#dc3545";
      case USER_ROLES.TRAINER:
        return "#28a745";
      case USER_ROLES.VIEWER:
        return "#6c757d";
      default:
        return "#6c757d";
    }
  }};
`;

const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: none;
  background: ${(props) => (props.active ? "white" : "transparent")};
  color: ${(props) => (props.active ? "#007bff" : "#6c757d")};
  cursor: pointer;
  border-bottom: 2px solid
    ${(props) => (props.active ? "#007bff" : "transparent")};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "white" : "#e9ecef")};
  }
`;

const App = () => {
  const [blockList, setBlockList] = useRecoilState(blockListSelector);
  const [appState, setAppState] = useRecoilState(appStateAtom);

  // ✅ 사용자 관리 상태
  const [currentUser, setCurrentUser] = useState({
    id: "user001",
    name: "테스트 사용자",
    role: USER_ROLES.ADMIN, // 테스트용으로 관리자 권한
  });

  // ✅ 탭 관리 상태
  const [activeTab, setActiveTab] = useState("scenarios");

  // ✅ 훈련 관련 상태
  const [trainingResult, setTrainingResult] = useState(null);
  const [isTrainingMode, setIsTrainingMode] = useState(false);

  const createNewBlock = (blockData) => {
    setBlockList((blockList) => [...blockList, blockData]);
  };

  const modifyBlock = (blockData) => {
    setBlockList((blockList) => {
      const targetIndex = blockList.findIndex(
        (data) => data.sceneId === blockData.sceneId
      );
      if (targetIndex === -1) {
        alert(`수정하고자하는 Scene ${blockData.sceneId}을 찾을 수 없습니다.`);
        return blockList;
      }
      return [
        ...blockList.slice(0, targetIndex),
        blockData,
        ...blockList.slice(targetIndex + 1),
      ];
    });
    setAppState({
      isSceneFormOpened: false,
      modifySceneId: null,
    });
  };

  // ✅ 승인 상태 업데이트 처리
  const handleApprovalUpdate = (updatedBlock) => {
    setBlockList((blockList) => {
      const targetIndex = blockList.findIndex(
        (data) => data.sceneId === updatedBlock.sceneId
      );
      if (targetIndex === -1) return blockList;

      return [
        ...blockList.slice(0, targetIndex),
        updatedBlock,
        ...blockList.slice(targetIndex + 1),
      ];
    });
  };

  // ✅ 훈련 완료 처리
  const handleTrainingComplete = (result) => {
    setTrainingResult(result);
    setIsTrainingMode(false);
  };

  // ✅ 훈련 재시작
  const handleRetryTraining = () => {
    setTrainingResult(null);
    setIsTrainingMode(true);
  };

  // ✅ 시나리오 관리로 돌아가기
  const handleBackToScenarios = () => {
    setTrainingResult(null);
    setIsTrainingMode(false);
    setActiveTab("scenarios");
  };

  // ✅ 사용자 역할 변경 (테스트용)
  const changeUserRole = (newRole) => {
    setCurrentUser((prev) => ({ ...prev, role: newRole }));
  };

  // ✅ 훈련 시작
  const startTraining = () => {
    setIsTrainingMode(true);
    setTrainingResult(null);
    setActiveTab("training");
  };

  return (
    <Container>
      {/* ✅ 사용자 정보 표시 */}
      <UserInfo>
        <div>👤 {currentUser.name}</div>
        <RoleBadge role={currentUser.role}>
          {currentUser.role === USER_ROLES.ADMIN && "🔐 관리자"}
          {currentUser.role === USER_ROLES.TRAINER && "🎯 훈련자"}
          {currentUser.role === USER_ROLES.VIEWER && "👁️ 조회자"}
        </RoleBadge>
        <div style={{ marginTop: "5px", fontSize: "10px" }}>
          <button
            onClick={() => changeUserRole(USER_ROLES.ADMIN)}
            style={{ marginRight: "5px", fontSize: "8px" }}
          >
            관리자
          </button>
          <button
            onClick={() => changeUserRole(USER_ROLES.TRAINER)}
            style={{ marginRight: "5px", fontSize: "8px" }}
          >
            훈련자
          </button>
          <button
            onClick={() => changeUserRole(USER_ROLES.VIEWER)}
            style={{ fontSize: "8px" }}
          >
            조회자
          </button>
        </div>
      </UserInfo>

      <ControlMenu />

      {/* ✅ 탭 네비게이션 */}
      <TabContainer>
        <Tab
          active={activeTab === "scenarios"}
          onClick={() => setActiveTab("scenarios")}
        >
          📚 시나리오 관리
        </Tab>
        <Tab
          active={activeTab === "approval"}
          onClick={() => setActiveTab("approval")}
        >
          🔐 승인 관리
        </Tab>
        <Tab
          active={activeTab === "training"}
          onClick={() => setActiveTab("training")}
        >
          🎯 훈련 진행
        </Tab>
      </TabContainer>

      {/* ✅ 탭별 콘텐츠 */}
      {activeTab === "scenarios" && (
        <>
          {appState.isSceneFormOpened && (
            <ScriptInput
              blockList={blockList}
              createNewBlock={createNewBlock}
              modifyBlock={modifyBlock}
              currentUser={currentUser}
            />
          )}
          <BlockContainer>
            <ScriptView />
          </BlockContainer>
        </>
      )}

      {activeTab === "approval" && (
        <ApprovalManager
          blockList={blockList}
          onApprovalUpdate={handleApprovalUpdate}
          currentUser={currentUser}
        />
      )}

      {activeTab === "training" && (
        <>
          {trainingResult ? (
            <TrainingResult
              result={trainingResult}
              onRetry={handleRetryTraining}
              onBackToScenarios={handleBackToScenarios}
            />
          ) : (
            <TrainingSession
              blockList={blockList}
              onTrainingComplete={handleTrainingComplete}
              currentUser={currentUser}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default App;
