/**
 * 시나리오 생성기 패널 컴포넌트
 * 관리자 페이지에서 시나리오 생성, 검증, 변환 기능을 제공
 */

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import type {
  ScenarioGeneratorEvent,
  ConversionOptions,
  ValidationResult,
} from '../../types';
import { scenarioGeneratorService } from '../../services/scenarioGeneratorService';
import {
  FaWrench,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSearch,
  FaChartBar,
} from 'react-icons/fa';

const Panel = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const PanelTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button<{
  $variant?: 'primary' | 'secondary' | 'success' | 'danger';
}>`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #1e7e34; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'secondary':
      default:
        return `
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          &:hover { background: #e9ecef; }
        `;
    }
  }}
`;

const FileInput = styled.input`
  display: none;
`;

const StatusMessage = styled.div<{
  $type?: 'success' | 'error' | 'warning' | 'info';
}>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'error':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'warning':
        return `
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'info':
      default:
        return `
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
    }
  }}
`;

const ValidationResults = styled.div`
  margin-top: 16px;
`;

const ErrorList = styled.ul`
  margin: 8px 0;
  padding-left: 20px;
  color: #721c24;
`;

const WarningList = styled.ul`
  margin: 8px 0;
  padding-left: 20px;
  color: #856404;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

interface ScenarioGeneratorPanelProps {
  scenarios: ScenarioGeneratorEvent[];
  onScenariosUpdate: (scenarios: ScenarioGeneratorEvent[]) => void;
}

const ScenarioGeneratorPanel: React.FC<ScenarioGeneratorPanelProps> = ({
  scenarios,
  onScenariosUpdate,
}) => {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (
    type: 'success' | 'error' | 'warning' | 'info',
    text: string
  ) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await scenarioGeneratorService.loadScenarioFromFile(file);
      onScenariosUpdate(data);
      showMessage('success', '시나리오 파일을 성공적으로 로드했습니다.');
    } catch (error) {
      showMessage(
        'error',
        error instanceof Error ? error.message : '파일 로드에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = () => {
    if (scenarios.length === 0) {
      showMessage('warning', '검증할 시나리오가 없습니다.');
      return;
    }

    const result = scenarioGeneratorService.validateScenarioData(scenarios);
    setValidationResult(result);

    if (result.valid) {
      showMessage('success', '모든 시나리오가 유효합니다.');
    } else {
      showMessage(
        'error',
        `${result.errors.length}개의 오류가 발견되었습니다.`
      );
    }
  };

  const handleExportJSON = () => {
    if (scenarios.length === 0) {
      showMessage('warning', '내보낼 시나리오가 없습니다.');
      return;
    }

    scenarioGeneratorService.downloadScenarioAsJSON(scenarios);
    showMessage('success', 'JSON 파일이 다운로드되었습니다.');
  };

  const handleExportSQL = () => {
    if (scenarios.length === 0) {
      showMessage('warning', '내보낼 시나리오가 없습니다.');
      return;
    }

    const options: ConversionOptions = {
      teamId: 1,
      createdBy: 1,
      backup: false,
      verbose: false,
      debug: false,
    };

    scenarioGeneratorService.downloadScenarioAsSQL(scenarios, options);
    showMessage('success', 'SQL 파일이 다운로드되었습니다.');
  };

  const stats =
    scenarios.length > 0
      ? scenarioGeneratorService.generateStatistics(scenarios)
      : null;

  return (
    <Panel>
      <PanelTitle>
        <FaWrench className="w-5 h-5" />
        시나리오 생성기
      </PanelTitle>

      {message && (
        <StatusMessage $type={message.type}>
          <span>
            {message.type === 'success' ? (
              <FaCheckCircle className="w-4 h-4" />
            ) : message.type === 'error' ? (
              <FaTimes className="w-4 h-4" />
            ) : message.type === 'warning' ? (
              <FaExclamationTriangle className="w-4 h-4" />
            ) : (
              <FaInfoCircle className="w-4 h-4" />
            )}
          </span>
          {message.text}
        </StatusMessage>
      )}

      <ButtonGroup>
        <Button
          $variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          📁 파일 가져오기
        </Button>
        <Button
          $variant="primary"
          onClick={handleValidate}
          disabled={isLoading}
        >
          <FaSearch className="w-4 h-4 mr-2" />
          검증하기
        </Button>
        <Button
          $variant="success"
          onClick={handleExportJSON}
          disabled={scenarios.length === 0}
        >
          📤 JSON 내보내기
        </Button>
        <Button
          $variant="success"
          onClick={handleExportSQL}
          disabled={scenarios.length === 0}
        >
          📤 SQL 내보내기
        </Button>
      </ButtonGroup>

      <FileInput
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
      />

      {validationResult && (
        <ValidationResults>
          <StatusMessage $type={validationResult.valid ? 'success' : 'error'}>
            <span>
              {validationResult.valid ? (
                <FaCheckCircle className="w-4 h-4" />
              ) : (
                <FaTimes className="w-4 h-4" />
              )}
            </span>
            검증 결과: {validationResult.valid ? '유효함' : '오류 있음'}
          </StatusMessage>

          {validationResult.errors.length > 0 && (
            <ErrorList>
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ErrorList>
          )}

          {validationResult.warnings.length > 0 && (
            <WarningList>
              {validationResult.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </WarningList>
          )}
        </ValidationResults>
      )}

      {stats && (
        <div>
          <PanelTitle>
            <FaChartBar className="w-5 h-5" />
            통계
          </PanelTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalEvents}</StatValue>
              <StatLabel>이벤트 수</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.totalOptions}</StatValue>
              <StatLabel>선택 옵션 수</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.averageOptionsPerEvent}</StatValue>
              <StatLabel>평균 옵션 수</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.disasterTypes.length}</StatValue>
              <StatLabel>재난 유형</StatLabel>
            </StatCard>
          </StatsGrid>
        </div>
      )}
    </Panel>
  );
};

export default ScenarioGeneratorPanel;
