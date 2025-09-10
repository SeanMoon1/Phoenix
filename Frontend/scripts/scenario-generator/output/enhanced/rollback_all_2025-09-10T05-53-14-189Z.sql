-- =====================================================
-- Phoenix 시나리오 데이터 롤백
-- 생성일: 2025-09-10T05:53:14.189Z
-- =====================================================

START TRANSACTION;

-- 시나리오 SCEN001 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'SCEN001');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'SCEN001');
DELETE FROM scenario WHERE scenario_code = 'SCEN001';

-- 시나리오 FIR594184 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'FIR594184');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'FIR594184');
DELETE FROM scenario WHERE scenario_code = 'FIR594184';

-- 시나리오 EMERGENCY001 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'EMERGENCY001');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'EMERGENCY001');
DELETE FROM scenario WHERE scenario_code = 'EMERGENCY001';

-- 시나리오 EME594185 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'EME594185');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'EME594185');
DELETE FROM scenario WHERE scenario_code = 'EME594185';

-- 시나리오 TRAFFIC001 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'TRAFFIC001');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'TRAFFIC001');
DELETE FROM scenario WHERE scenario_code = 'TRAFFIC001';

-- 시나리오 TRA594185 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'TRA594185');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'TRA594185');
DELETE FROM scenario WHERE scenario_code = 'TRA594185';

-- 시나리오 EAR594186 관련 데이터 삭제
DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'EAR594186');
DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = 'EAR594186');
DELETE FROM scenario WHERE scenario_code = 'EAR594186';

COMMIT;

-- 롤백 완료