import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ControlMenu from "./Components/ControlMenu/ControlMenu";
import ScriptView from "./Components/ScriptView";
import { useAppStateStore } from "./Stores/atom";
import { useBlockListSelector } from "./Stores/selector";
import type { User } from "./types";
import { UserRole } from "./types";
import { loadBlockList } from "./Utils/api";

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

const RoleBadge = styled.span<{ role: UserRole }>`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background-color: ${(props) => {
    switch (props.role) {
      case UserRole.ADMIN:
        return "#dc3545";
      case UserRole.TRAINER:
        return "#28a745";
      case UserRole.VIEWER:
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

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border: none;
  background: ${(props) => (props.$active ? "white" : "transparent")};
  color: ${(props) => (props.$active ? "#007bff" : "#6c757d")};
  cursor: pointer;
  border-bottom: 2px solid
    ${(props) => (props.$active ? "#007bff" : "transparent")};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "white" : "#e9ecef")};
  }
`;

// 시나리오 편집 폼 스타일 (메인 화면용)
const SceneFormSection = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SceneFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;

  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const SceneFormContent = styled.div`
  padding: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FormField = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  select {
    background: white;
    cursor: pointer;
  }
`;

const OptionsList = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background: #f8f9fa;
`;

const OptionItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  input {
    padding: 6px 8px;
    font-size: 13px;
  }
`;

const AddOptionButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;

  &:hover {
    background: #218838;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 10px 20px;
  border: 1px solid ${(props) => (props.primary ? "#007bff" : "#6c757d")};
  background: ${(props) => (props.primary ? "#007bff" : "white")};
  color: ${(props) => (props.primary ? "white" : "#6c757d")};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${(props) => (props.primary ? "#0056b3" : "#f8f9fa")};
    border-color: ${(props) => (props.primary ? "#0056b3" : "#5a6268")};
  }
`;

const App: React.FC = () => {
  const { setBlockList } = useBlockListSelector();
  const { appState, closeSceneForm } = useAppStateStore();

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedBlockList = loadBlockList();
    if (savedBlockList.length > 0) {
      setBlockList(savedBlockList);
    }
  }, [setBlockList]);

  // 사용자 역할을 관리자로 고정
  const currentUser: User = {
    id: "user001",
    name: "시나리오 관리자",
    role: UserRole.ADMIN,
  };

  // 탭 관리 상태
  const [activeTab, setActiveTab] = useState<string>("scenarios");

  return (
    <Container>
      {/* 사용자 정보 표시 */}
      <UserInfo>
        <div>👤 {currentUser.name}</div>
        <RoleBadge role={currentUser.role}>🔐 관리자</RoleBadge>
      </UserInfo>

      <ControlMenu />

      {/* 탭 네비게이션 */}
      <TabContainer>
        <Tab
          $active={activeTab === "scenarios"}
          onClick={() => setActiveTab("scenarios")}
        >
          📚 시나리오 관리
        </Tab>
      </TabContainer>

      {/* 시나리오 콘텐츠 */}
      {activeTab === "scenarios" && (
        <BlockContainer>
          {/* 시나리오 편집 폼이 열려있을 때 */}
          {appState.isSceneFormOpened ? (
            <SceneFormSection>
              <SceneFormHeader>
                <h3>재난 대응 훈련 시나리오 생성</h3>
                <CloseButton onClick={closeSceneForm}>✕</CloseButton>
              </SceneFormHeader>
              <SceneFormContent>
                <FormRow>
                  <FormField>
                    <label>재난 유형:</label>
                    <select defaultValue="fire">
                      <option value="fire">화재</option>
                      <option value="earthquake">지진</option>
                      <option value="flood">홍수</option>
                      <option value="emergency">응급상황</option>
                      <option value="complex">복합재난</option>
                    </select>
                  </FormField>

                  <FormField>
                    <label>난이도:</label>
                    <select defaultValue="medium">
                      <option value="easy">초급</option>
                      <option value="medium">중급</option>
                      <option value="hard">고급</option>
                    </select>
                  </FormField>
                </FormRow>

                <FormField>
                  <label>장면 ID:</label>
                  <input type="text" placeholder="#4-1" />
                </FormField>

                <FormField>
                  <label>장면 제목:</label>
                  <input type="text" placeholder="화재 발생 현장 도착" />
                </FormField>

                <FormField>
                  <label>장면 설명:</label>
                  <textarea
                    placeholder="화재 현장에 도착했습니다. 연기가 가득한 건물을 확인하고 대응 방안을 결정하세요."
                    rows={4}
                  />
                </FormField>

                <FormField>
                  <label>장면 스크립트:</label>
                  <textarea
                    placeholder="화재 현장 상황을 파악하고 신속하게 대응하세요. 연기와 불길이 보이는 건물입니다."
                    rows={3}
                  />
                </FormField>

                {/* 주석 처리된 미래 기능들 */}
                {/* <FormField>
                  <label>Character Image:</label>
                  <input type="text" placeholder="wondering.png" />
                </FormField>

                <FormField>
                  <label>Background Image:</label>
                  <input type="text" placeholder="park.png (선택입력)" />
                </FormField>

                <FormField>
                  <label>Scene Sound:</label>
                  <input type="text" placeholder="hmm.mp3" />
                </FormField> */}

                <FormField>
                  <label>선택지:</label>
                  <OptionsList>
                    <OptionItem>
                      <input
                        type="text"
                        placeholder="답변 (예: 소화기로 진화 시도)"
                      />
                      <input
                        type="text"
                        placeholder="반응 (예: 화재 확산 방지)"
                      />
                      <input type="text" placeholder="다음 장면 ID" />
                    </OptionItem>
                    <OptionItem>
                      <input
                        type="text"
                        placeholder="답변 (예: 대피 경로 확인)"
                      />
                      <input type="text" placeholder="반응 (예: 안전한 대피)" />
                      <input type="text" placeholder="다음 장면 ID" />
                    </OptionItem>
                  </OptionsList>
                  <AddOptionButton>선택지 추가</AddOptionButton>
                </FormField>

                <FormActions>
                  <ActionButton>선택지 삭제</ActionButton>
                  <ActionButton primary>시나리오 저장</ActionButton>
                </FormActions>
              </SceneFormContent>
            </SceneFormSection>
          ) : (
            /* 기존 시나리오 목록 표시 */
            <ScriptView />
          )}
        </BlockContainer>
      )}
    </Container>
  );
};

export default App;
