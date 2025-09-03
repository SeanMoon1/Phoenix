import React, { useState } from "react";
import styled from "styled-components";
import { APPROVAL_STATUS, APPROVAL_STATUS_INFO, USER_ROLES } from "../ScriptInput/constant";

const Container = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 10px 0;
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ApprovalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ApprovalItem = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${props => props.color};
`;

const ItemContent = styled.div`
  margin-bottom: 15px;
`;

const ItemTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
`;

const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  font-size: 14px;
  color: #666;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &.approve {
    background-color: #4CAF50;
    color: white;
    &:hover { background-color: #45a049; }
  }

  &.reject {
    background-color: #f44336;
    color: white;
    &:hover { background-color: #da190b; }
  }

  &.view {
    background-color: #2196F3;
    color: white;
    &:hover { background-color: #0b7dda; }
  }
`;

const RejectionModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
`;

const ModalTitle = styled.h4`
  margin: 0 0 15px 0;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  resize: vertical;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ApprovalManager = ({ blockList, onApprovalUpdate, currentUser }) => {
  const [rejectionModal, setRejectionModal] = useState({ show: false, sceneId: "", reason: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  // 승인 대기 중인 시나리오만 필터링
  const pendingScenarios = blockList.filter(block => 
    filterStatus === "all" || block.approvalStatus === filterStatus
  );

  const handleApprove = (sceneId) => {
    const updatedBlock = {
      ...blockList.find(b => b.sceneId === sceneId),
      approvalStatus: APPROVAL_STATUS.APPROVED,
      approvedBy: currentUser?.id || "admin",
      approvedAt: new Date().toISOString(),
      rejectionReason: ""
    };
    onApprovalUpdate(updatedBlock);
  };

  const handleReject = (sceneId) => {
    setRejectionModal({ show: true, sceneId, reason: "" });
  };

  const confirmRejection = () => {
    const { sceneId, reason } = rejectionModal;
    const updatedBlock = {
      ...blockList.find(b => b.sceneId === sceneId),
      approvalStatus: APPROVAL_STATUS.REJECTED,
      approvedBy: currentUser?.id || "admin",
      approvedAt: new Date().toISOString(),
      rejectionReason: reason
    };
    onApprovalUpdate(updatedBlock);
    setRejectionModal({ show: false, sceneId: "", reason: "" });
  };

  const cancelRejection = () => {
    setRejectionModal({ show: false, sceneId: "", reason: "" });
  };

  const canManageApproval = () => {
    return currentUser?.role === USER_ROLES.ADMIN;
  };

  if (!canManageApproval()) {
    return (
      <Container>
        <Title>🚫 접근 권한 없음</Title>
        <p>시나리오 승인 관리에는 관리자 권한이 필요합니다.</p>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🔐 시나리오 승인 관리</Title>
      
      {/* 필터 */}
      <div style={{ marginBottom: 15 }}>
        <label>상태별 필터: </label>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ marginLeft: 10, padding: '5px' }}
        >
          <option value="all">전체</option>
          <option value="draft">초안</option>
          <option value="pending">승인 대기</option>
          <option value="approved">승인됨</option>
          <option value="rejected">거부됨</option>
        </select>
      </div>

      <ApprovalList>
        {pendingScenarios.map(block => (
          <ApprovalItem key={block.sceneId}>
            <ItemHeader>
              <div>
                <strong>{block.sceneId}</strong>
                <span style={{ marginLeft: 10, color: '#666' }}>
                  {block.disasterType} • {block.difficulty}
                </span>
              </div>
              <StatusBadge color={APPROVAL_STATUS_INFO[block.approvalStatus]?.color}>
                {APPROVAL_STATUS_INFO[block.approvalStatus]?.emoji} 
                {APPROVAL_STATUS_INFO[block.approvalStatus]?.name}
              </StatusBadge>
            </ItemHeader>

            <ItemContent>
              <ItemTitle>{block.sceneScript.substring(0, 100)}...</ItemTitle>
              <ItemDetails>
                <DetailItem>
                  <span>📝 작성자:</span>
                  <span>{block.createdBy || "익명"}</span>
                </DetailItem>
                <DetailItem>
                  <span>📅 작성일:</span>
                  <span>{new Date(block.createdAt).toLocaleDateString()}</span>
                </DetailItem>
                {block.approvedBy && (
                  <DetailItem>
                    <span>✅ 승인자:</span>
                    <span>{block.approvedBy}</span>
                  </DetailItem>
                )}
                {block.approvedAt && (
                  <DetailItem>
                    <span>⏰ 승인일:</span>
                    <span>{new Date(block.approvedAt).toLocaleDateString()}</span>
                  </DetailItem>
                )}
                {block.rejectionReason && (
                  <DetailItem>
                    <span>❌ 거부 사유:</span>
                    <span>{block.rejectionReason}</span>
                  </DetailItem>
                )}
              </ItemDetails>
            </ItemContent>

            <ActionButtons>
              <Button className="view" onClick={() => window.open(`#${block.sceneId}`)}>
                👁️ 상세보기
              </Button>
              {block.approvalStatus === APPROVAL_STATUS.PENDING && (
                <>
                  <Button className="approve" onClick={() => handleApprove(block.sceneId)}>
                    ✅ 승인
                  </Button>
                  <Button className="reject" onClick={() => handleReject(block.sceneId)}>
                    ❌ 거부
                  </Button>
                </>
              )}
              {block.approvalStatus === APPROVAL_STATUS.REJECTED && (
                <Button className="approve" onClick={() => handleApprove(block.sceneId)}>
                    ✅ 재승인
                  </Button>
              )}
            </ActionButtons>
          </ApprovalItem>
        ))}
      </ApprovalList>

      {/* 거부 사유 입력 모달 */}
      {rejectionModal.show && (
        <RejectionModal>
          <ModalContent>
            <ModalTitle>❌ 시나리오 거부 사유</ModalTitle>
            <TextArea
              placeholder="거부 사유를 입력하세요..."
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
            />
            <ModalButtons>
              <Button onClick={cancelRejection}>취소</Button>
              <Button className="reject" onClick={confirmRejection}>거부</Button>
            </ModalButtons>
          </ModalContent>
        </RejectionModal>
      )}
    </Container>
  );
};

export default ApprovalManager;
