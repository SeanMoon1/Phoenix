-- =====================================================
-- Phoenix 시나리오 데이터 롤백
-- 생성일: 2025-09-10T06:20:34.161Z
-- =====================================================

START TRANSACTION;

-- 시나리오 SCEN001 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'SCEN001');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'SCEN001');
DELETE FROM scenario WHERE scenario_code = 'SCEN001';

-- 시나리오 FIR234158 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'FIR234158');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'FIR234158');
DELETE FROM scenario WHERE scenario_code = 'FIR234158';

COMMIT;

-- 롤백 완료