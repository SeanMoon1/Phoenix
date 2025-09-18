import React from 'react';
import styled from 'styled-components';
import { UserRole } from '../../../types/game';

// ScriptToolPage 우측 패널 스타일드 컴포넌트
const RightPanel = styled.div`
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;

  @media (max-width: 1200px) {
    width: 280px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const AdminSection = styled.div`
  margin-bottom: 30px;
`;

const AdminTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 30px;
`;

const QuickActionButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'success' | 'danger';
}>`
  padding: 16px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-height: 80px;
  justify-content: center;

  .icon {
    font-size: 20px;
  }

  .text {
    font-size: 11px;
    text-align: center;
    line-height: 1.2;
  }

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #ff6b35 0%, #dc3545 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
          &:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
          &:hover { 
            background: #218838;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          &:hover { 
            background: #c82333;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
          }
        `;
      case 'secondary':
      default:
        return `
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          &:hover { 
            background: #e9ecef;
            transform: translateY(-2px);
          }
        `;
    }
  }}
`;

const StatsCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    color: #666;
    font-size: 13px;
  }

  .value {
    color: #333;
    font-weight: 600;
  }
`;

const UserInfo = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const RoleBadge = styled.span<{ role: UserRole }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.role) {
      case UserRole.ADMIN:
        return '#dc3545';
      case UserRole.TRAINER:
        return '#28a745';
      case UserRole.VIEWER:
        return '#6c757d';
      default:
        return '#6c757d';
    }
  }};
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
`;

const UserStat = styled.div`
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;

  .number {
    font-weight: bold;
    color: #333;
    font-size: 16px;
  }

  .label {
    font-size: 11px;
    color: #666;
    margin-top: 2px;
  }
`;

// Props 인터페이스
interface AdminPanelProps {
  currentUser: {
    name: string;
    role: UserRole;
    user_level: number;
    current_tier: string;
  };
  stats: {
    total: number;
    byType: {
      fire: number;
      earthquake: number;
      flood: number;
      emergency: number;
    };
    byDifficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
  onCreateScenario: () => void;
  onExportScenarios: () => void;
  onImportScenarios: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAllScenarios: () => void;
}

// ScriptToolPage의 우측 패널 JSX 부분
const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  stats,
  onCreateScenario,
  onExportScenarios,
  onImportScenarios,
  onDeleteAllScenarios,
}) => {
  return (
    <RightPanel>
      {/* 사용자 정보 */}
      <UserInfo>
        <UserProfile>
          <UserDetails>
            <UserName>{currentUser.name}</UserName>
            <RoleBadge role={currentUser.role}>🔐 관리자</RoleBadge>
          </UserDetails>
        </UserProfile>
        <UserStats>
          <UserStat>
            <div className="number">{currentUser.user_level}</div>
            <div className="label">레벨</div>
          </UserStat>
          <UserStat>
            <div className="number">{currentUser.current_tier}</div>
            <div className="label">등급</div>
          </UserStat>
        </UserStats>
      </UserInfo>

      {/* 빠른 작업 버튼들 - 2x2 그리드 */}
      <AdminSection>
        <AdminTitle>⚡ 빠른 작업</AdminTitle>
        <QuickActions>
          <QuickActionButton $variant="primary" onClick={onCreateScenario}>
            <span className="icon">➕</span>
            <span className="text">시나리오 생성</span>
          </QuickActionButton>

          <QuickActionButton
            $variant="secondary"
            onClick={() => document.getElementById('import-file')?.click()}
          >
            <span className="icon">📥</span>
            <span className="text">시나리오 가져오기</span>
          </QuickActionButton>

          <QuickActionButton $variant="success" onClick={onExportScenarios}>
            <span className="icon">📤</span>
            <span className="text">시나리오 내보내기</span>
          </QuickActionButton>

          <QuickActionButton $variant="danger" onClick={onDeleteAllScenarios}>
            <span className="icon">🗑️</span>
            <span className="text">모든 시나리오 삭제</span>
          </QuickActionButton>

          <input
            id="import-file"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={onImportScenarios}
          />
        </QuickActions>
      </AdminSection>

      {/* 시나리오 통계 */}
      <AdminSection>
        <AdminTitle>📊 시나리오 통계</AdminTitle>
        <StatsCard>
          <StatItem>
            <span className="label">전체 시나리오</span>
            <span className="value">{stats.total}개</span>
          </StatItem>
          <StatItem>
            <span className="label">화재 대응</span>
            <span className="value">{stats.byType.fire}개</span>
          </StatItem>
          <StatItem>
            <span className="label">지진 대응</span>
            <span className="value">{stats.byType.earthquake}개</span>
          </StatItem>
          <StatItem>
            <span className="label">홍수 대응</span>
            <span className="value">{stats.byType.flood}개</span>
          </StatItem>
          <StatItem>
            <span className="label">응급상황</span>
            <span className="value">{stats.byType.emergency}개</span>
          </StatItem>
        </StatsCard>
      </AdminSection>

      {/* 난이도별 통계 */}
      <AdminSection>
        <AdminTitle>🎯 난이도별 분포</AdminTitle>
        <StatsCard>
          <StatItem>
            <span className="label">초급</span>
            <span className="value">{stats.byDifficulty.easy}개</span>
          </StatItem>
          <StatItem>
            <span className="label">중급</span>
            <span className="value">{stats.byDifficulty.medium}개</span>
          </StatItem>
          <StatItem>
            <span className="label">고급</span>
            <span className="value">{stats.byDifficulty.hard}개</span>
          </StatItem>
        </StatsCard>
      </AdminSection>
    </RightPanel>
  );
};

export default AdminPanel;
