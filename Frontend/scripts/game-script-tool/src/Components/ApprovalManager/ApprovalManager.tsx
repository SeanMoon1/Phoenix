import React, { useState } from "react";
import styled from "styled-components";
import { APPROVAL_STATUS_INFO, USER_ROLES } from "../ScriptInput/constants";
import { ScriptBlock, User, ApprovalStatus as ApprovalStatusType } from "../../types";

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

const StatusBadge = styled.span<{ color: string }>`
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

const Button = styled.button<{ variant?: 'approve' | 'reject' | 'view' }>`
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
    &:hover { background-color: #1976D2; }
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const RejectionModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

interface ApprovalManagerProps {
  blockList: ScriptBlock[];
  onApprovalUpdate: (updatedBlock: ScriptBlock) => void;
  currentUser: User;
}

const ApprovalManager: React.FC<ApprovalManagerProps> = ({
  blockList,
  onApprovalUpdate,
  currentUser,
}) => {
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    blockId: string | null;
    reason: string;
  }>({
    isOpen: false,
    blockId: null,
    reason: "",
  });

  const canManageApproval = (): boolean => {
    return currentUser.role === USER_ROLES.ADMIN;
  };

  const handleApprove = (block: ScriptBlock): void => {
    const updatedBlock: ScriptBlock = {
      ...block,
      approvalStatus: ApprovalStatusType.APPROVED,
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
    };
    onApprovalUpdate(updatedBlock);
  };

  const handleReject = (block: ScriptBlock): void => {
    setRejectionModal({
      isOpen: true,
      blockId: block.sceneId,
      reason: "",
    });
  };

  const confirmRejection = (): void => {
    if (!rejectionModal.blockId) return;

    const block = blockList.find(b => b.sceneId === rejectionModal.blockId);
    if (!block) return;

    const updatedBlock: ScriptBlock = {
      ...block,
      approvalStatus: ApprovalStatusType.REJECTED,
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
      rejectionReason: rejectionModal.reason,
    };
    onApprovalUpdate(updatedBlock);
    setRejectionModal({ isOpen: false, blockId: null, reason: "" });
  };

  const getStatusInfo = (status: ApprovalStatusType) => {
    return APPROVAL_STATUS_INFO[status] || APPROVAL_STATUS_INFO[ApprovalStatusType.DRAFT];
  };

  if (!canManageApproval()) {
    return (
      <Container>
        <Title>🚫 접근 권한 없음</Title>
        <p>시나리오 승인 관리에는 관리자 권한이 필요합니다.</p>
      </Container>
    );
  }

  const pendingBlocks = blockList.filter(block => 
    block.approvalStatus === ApprovalStatusType.PENDING
  );

  return (
    <Container>
      <Title>🔐 승인 관리</Title>
      <p>승인 대기 중인 시나리오: {pendingBlocks.length}개</p>
      
      <ApprovalList>
        {pendingBlocks.map((block) => {
          const statusInfo = getStatusInfo(block.approvalStatus);
          
          return (
            <ApprovalItem key={block.sceneId}>
              <ItemHeader>
                <div>
                  <strong>Scene {block.sceneId}</strong>
                  <StatusBadge color={statusInfo.color}>
                    {statusInfo.emoji} {statusInfo.name}
                  </StatusBadge>
                </div>
              </ItemHeader>
              
              <ItemContent>
                <ItemTitle>{block.title || block.content}</ItemTitle>
                <ItemDetails>
                  <DetailItem>
                    <span>📝 작성자:</span>
                    <span>{block.createdBy}</span>
                  </DetailItem>
                  <DetailItem>
                    <span>📅 작성일:</span>
                    <span>{new Date(block.createdAt).toLocaleDateString()}</span>
                  </DetailItem>
                  <DetailItem>
                    <span>🔥 재난 유형:</span>
                    <span>{block.disasterType || "미지정"}</span>
                  </DetailItem>
                  <DetailItem>
                    <span>⚡ 난이도:</span>
                    <span>{block.difficulty || "미지정"}</span>
                  </DetailItem>
                </ItemDetails>
              </ItemContent>
              
              <ActionButtons>
                <Button variant="view" onClick={() => {}}>
                  👁️ 상세보기
                </Button>
                <Button variant="approve" onClick={() => handleApprove(block)}>
                  ✅ 승인
                </Button>
                <Button variant="reject" onClick={() => handleReject(block)}>
                  ❌ 거부
                </Button>
              </ActionButtons>
            </ApprovalItem>
          );
        })}
      </ApprovalList>

      {rejectionModal.isOpen && (
        <RejectionModal>
          <ModalContent>
            <h3>거부 사유 입력</h3>
            <p>Scene {rejectionModal.blockId}을 거부하는 이유를 입력해주세요.</p>
            <TextArea
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="거부 사유를 입력하세요..."
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button onClick={() => setRejectionModal({ isOpen: false, blockId: null, reason: "" })}>
                취소
              </Button>
              <Button variant="reject" onClick={confirmRejection}>
                거부 확인
              </Button>
            </div>
          </ModalContent>
        </RejectionModal>
      )}
    </Container>
  );
};

export default ApprovalManager;
