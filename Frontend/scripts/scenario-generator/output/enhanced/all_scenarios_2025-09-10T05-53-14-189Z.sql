-- =====================================================
-- Phoenix 시나리오 데이터 배치 삽입
-- 생성일: 2025-09-10T05:53:14.187Z
-- =====================================================

START TRANSACTION;

-- 시나리오 데이터 삽입
-- 시나리오 생성: 아파트 화재 경보
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'SCEN001', '아파트 화재 경보', '새벽 3시, 평화롭게 잠들어 있던 중 갑자기 날카로운 화재 경보가 울려 퍼집니다. 창문 밖으로 연기가 보이고, 복도에서 다른 주민들의 발걸음 소리가 들립니다. 아래층에서 화재가 발생한 것 같습니다. 가족의 안전이 걱정됩니다.', 'fire', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_SCEN001 = LAST_INSERT_ID();

-- 시나리오 생성: 출입문 손잡이와 연기 확인
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'FIR594184', '출입문 손잡이와 연기 확인', '심장이 터질 듯 뛰는 가운데, 문 앞에 선 당신. 복도에서 다른 주민들의 발걸음 소리가 들리고, 연기 냄새가 더 진해집니다. 손이 떨리고, 땀이 흘러내립니다. 가족의 안전이 걱정됩니다.', 'fire', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_FIR594184 = LAST_INSERT_ID();

-- 시나리오 생성: 화상 응급처치 상황
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'EMERGENCY001', '화상 응급처치 상황', '주방에서 요리를 하던 중 뜨거운 기름이 손등에 튀어 화상을 입었습니다. 손등이 빨갛게 달아오르고 따끔한 통증이 느껴집니다. 주변에는 찬물이 흐르는 수도꼭지가 있고, 응급처치 상자가 있습니다.', 'emergency', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_EMERGENCY001 = LAST_INSERT_ID();

-- 시나리오 생성: 화상 후 추가 처치
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'EME594185', '화상 후 추가 처치', '화상 부위를 찬물로 냉각시킨 후, 통증이 어느 정도 완화되었습니다. 하지만 여전히 빨갛고 따끔한 느낌이 있습니다. 이제 추가적인 처치가 필요한 상황입니다.', 'emergency', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_EME594185 = LAST_INSERT_ID();

-- 시나리오 생성: 교통사고 발생 시 초기 대응
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'TRAFFIC001', '교통사고 발생 시 초기 대응', '도로에서 교통사고가 발생했습니다. 차량이 충돌하여 앞유리가 깨지고 연기가 나기 시작했습니다. 사고 현장에는 다른 차량들이 지나가고 있고, 부상자가 차량 안에 있는 것 같습니다.', 'traffic', 'HIGH', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_TRAFFIC001 = LAST_INSERT_ID();

-- 시나리오 생성: 차량 안전 조치
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'TRA594185', '차량 안전 조치', '119에 신고를 완료했습니다. 이제 2차 사고를 방지하기 위한 차량 안전 조치가 필요합니다. 차량이 아직 움직일 수 있는 상태입니다.', 'traffic', 'HIGH', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_TRA594185 = LAST_INSERT_ID();

-- 시나리오 생성: 집안에서 지진 발생
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'EAR594186', '집안에서 지진 발생', '오후 2시, 집안에서 갑자기 땅이 흔들리기 시작했습니다. 지진이 발생했습니다.', 'earthquake', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_EAR594186 = LAST_INSERT_ID();

-- 선택 옵션 데이터 삽입
-- 선택 옵션 생성: 가족을 깨우고 "불이야! 대피해!" 소리치며 119에 ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer1', '가족을 깨우고 "불이야! 대피해!" 소리치며 119에 신고하기', '정답! 가족을 깨우고 화재를 신고하는 것이 가장 중요한 첫 번째 행동입니다. 신속한 대응이 생명을 구합니다.', '#1-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 불의 원인을 확인하러 혼자 나서기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer2', '불의 원인을 확인하러 혼자 나서기', '오답! 화재 상황에서는 원인을 확인하려 하지 말고 즉시 대피해야 합니다. 연기와 열기에 노출될 위험이 있습니다.', '#1-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 손등으로 출입문 손잡이 온도 만져보고, 문틈으로 연기와...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer1', '손등으로 출입문 손잡이 온도 만져보고, 문틈으로 연기와 불길 확인', '정답! 손잡이가 뜨거우면 복도에 화재가 있다는 뜻입니다. 문틈으로 연기와 불길을 확인하여 안전한 대피 경로를 선택할 수 있습니다.', '#1-3', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 바로 문을 열고 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer2', '바로 문을 열고 대피하기', '오답! 문을 열기 전에 손잡이 온도와 문틈을 확인하지 않으면 뜨거운 연기와 불길에 노출될 수 있습니다. 안전 확인이 먼저입니다.', '#1-3', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 비상계단으로 내려가며 연기를 피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer1', '비상계단으로 내려가며 연기를 피하기', '정답! 비상계단은 화재 시 가장 안전한 대피 경로입니다. 연기를 피하며 낮은 자세로 대피하세요.', '#1-4', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 엘리베이터로 빠르게 내려가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer2', '엘리베이터로 빠르게 내려가기', '오답! 화재 시에는 엘리베이터를 사용하면 안 됩니다. 정전되거나 연기에 가득 찰 수 있어 매우 위험합니다.', '#1-4', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 창문으로 신호 보내고 도움 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer3', '창문으로 신호 보내고 도움 기다리기', '부분 정답! 창문으로 신호를 보내는 것은 좋지만, 가능하면 직접 대피하는 것이 더 안전합니다. 시간이 지날수록 상황이 악화될 수 있습니다.', '#1-4', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 낮은 자세로 기어가며 연기 피하고 조용히 대피
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-4, @scenario_id_#1, 'answer1', '낮은 자세로 기어가며 연기 피하고 조용히 대피', '정답! 연기는 위로 올라가므로 낮은 자세로 기어가면 연기를 피할 수 있습니다. 조용히 대피하여 다른 사람들에게 혼란을 주지 않습니다.', '#1-5', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 숨 참고 뛰며 빠르게 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-4, @scenario_id_#1, 'answer2', '숨 참고 뛰며 빠르게 대피하기', '오답! 연기를 들이마시며 뛰면 더 많은 연기를 흡입하게 되어 위험합니다. 낮은 자세로 천천히 대피하는 것이 안전합니다.', '#1-5', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 소방관에게 상황 보고하고 이웃 주민 확인
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-5, @scenario_id_#1, 'answer1', '소방관에게 상황 보고하고 이웃 주민 확인', '정답! 소방관에게 정확한 상황을 보고하고, 이웃 주민들의 안전을 확인하는 것이 중요합니다. 협력이 생명을 구합니다.', '#1-6', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 혼자 건물로 돌아가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-5, @scenario_id_#1, 'answer2', '혼자 건물로 돌아가기', '오답! 화재가 진행 중인 건물로 다시 들어가는 것은 매우 위험합니다. 소방관의 지시를 기다리세요.', '#1-6', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 대피자 인원 확인하고 누락된 이웃 찾기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-6, @scenario_id_#1, 'answer1', '대피자 인원 확인하고 누락된 이웃 찾기', '정답! 누락된 이웃을 찾아 나서며, 모든 주민의 안전을 확인하는 것이 중요합니다. 협력이 생명을 구합니다.', '#2-1', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 화재 상황 지켜보기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-6, @scenario_id_#1, 'answer2', '화재 상황 지켜보기', '부분 정답! 화재 상황을 지켜보는 것도 중요하지만, 누락된 이웃을 먼저 찾는 것이 우선입니다. 시간이 지날수록 위험해집니다.', '#2-1', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 가스와 전기 차단 후 안전하게 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer1', '가스와 전기 차단 후 안전하게 대피하기', '정답! 가스와 전기를 차단하여 화재 확산을 막고, 안전하게 대피하는 것이 중요합니다. 생명이 최우선입니다.', '#2-2', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 소화기로 불 끄기 시도
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer2', '소화기로 불 끄기 시도', '오답! 화재가 진행 중일 때는 소화기로 불을 끄려 하지 말고 즉시 대피해야 합니다. 연기와 열기에 노출될 위험이 있습니다.', '#2-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 바로 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer3', '바로 대피하기', '부분 정답! 즉시 대피하는 것은 좋지만, 가능하면 가스와 전기를 차단한 후 대피하는 것이 더 안전합니다.', '#2-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 소화기로 불 끄며 감염된 자 경계
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer1', '소화기로 불 끄며 감염된 자 경계', '정답! 분사가 불을 삼키고, 괴물을 멀리한다. 생존의 맛이 입안에 퍼진다.', '#2-3', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 물로 불 끄기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer2', '물로 불 끄기', '정답! 차가운 물이 불을 꺼뜨리며, 괴물의 소리를 피한다. 대안의 승리.', '#2-3', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 바로 대피
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer3', '바로 대피', '오답! 불이 번지며 은신처를 삼키고, 괴물이 쫓아온다. 후회의 불길.', '#2-3', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 안전핀 뽑고 → 노즐 잡고 → 손잡이 움켜쥐고 → 불 ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-3, @scenario_id_#2, 'answer1', '안전핀 뽑고 → 노즐 잡고 → 손잡이 움켜쥐고 → 불 향해 분사', '정답! 분사가 불을 꺼뜨리고, 생존의 안도감이 밀려온다.', '#2-4', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 바로 분사하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-3, @scenario_id_#2, 'answer2', '바로 분사하기', '오답! 핀이 안 뽑혀 실패하고, 문이 부서지며 괴물이 쏟아진다.', '#2-4', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 바닥에 뒹굴어 불 끄고 감염된 자 피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-4, @scenario_id_#2, 'answer1', '바닥에 뒹굴어 불 끄고 감염된 자 피하기', '정답! 바닥의 먼지가 불을 삼키고, 괴물을 피해. 생존의 기쁨.', '#3-1', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 뛰며 불 끄기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-4, @scenario_id_#2, 'answer2', '뛰며 불 끄기', '오답! 불이 커지며 괴물이 추격하고, 고통이 몸을 찢는다.', '#3-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 대피 공간이나 경량 칸막이 이용해 우회 대피
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer1', '대피 공간이나 경량 칸막이 이용해 우회 대피', '정답! 대피 공간을 이용하여 안전한 경로로 우회 대피하는 것이 좋습니다. 영리한 대응입니다.', '#3-2', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 문 열고 돌진
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer2', '문 열고 돌진', '오답! 화재가 진행 중인 문을 열고 돌진하면 뜨거운 연기와 불길에 노출될 수 있습니다. 안전한 경로를 찾아야 합니다.', '#3-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 지지대 고리에 걸고 → 창밖 밀고 → 벨트 조이고 → ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer1', '지지대 고리에 걸고 → 창밖 밀고 → 벨트 조이고 → 벽 짚으며 내려가기', '정답! 바람을 가르며 착지하고, 괴물을 피해. 자유의 맛.', '#4-1', 10, 10, 125, 1, 1, NOW());

-- 선택 옵션 생성: 바로 뛰어내리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer2', '바로 뛰어내리기', '오답! 추락의 충격과 괴물의 이빨. 비극의 끝.', '#4-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 창문 닫고 소방서에 신고
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer1', '창문 닫고 소방서에 신고', '정답! 연기를 차단하고 소방서에 신고하여 도움을 청하는 것이 중요합니다. 안도의 한숨이 나옵니다.', '#5-1', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 바로 계단 대피
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer2', '바로 계단 대피', '오답! 연기가 진한 상황에서 바로 계단으로 대피하면 연기에 노출될 수 있습니다. 먼저 연기를 차단하고 신고해야 합니다.', '#5-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 방화벽의 문을 몸으로 밀어서 열기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer1', '방화벽의 문을 몸으로 밀어서 열기', '정답! 방화벽의 문은 비상시 몸으로 밀면 열리도록 설계되어 있습니다. 많은 사람들이 이를 모르고 갇혀 죽는 경우가 많습니다.', '#5-2', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 방화벽이 열릴 때까지 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer2', '방화벽이 열릴 때까지 기다리기', '오답! 방화벽은 화재가 진압될 때까지 자동으로 열리지 않습니다. 연기가 진해지면 위험해집니다.', '#5-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 다른 대피로를 찾기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer3', '다른 대피로를 찾기', '부분 정답! 다른 대피로를 찾는 것도 좋지만, 시간이 오래 걸릴 수 있습니다. 방화벽의 문을 먼저 시도해보세요.', '#5-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 다른 사람들에게 방화벽 문 열기 방법 알려주기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer1', '다른 사람들에게 방화벽 문 열기 방법 알려주기', '정답! 다른 사람들에게도 방화벽의 문을 몸으로 밀면 열린다는 것을 알려주어 모두가 안전하게 대피할 수 있도록 도와주세요.', '#4-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 바로 안전한 곳으로 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer2', '바로 안전한 곳으로 대피하기', '부분 정답! 자신의 안전도 중요하지만, 다른 사람들을 도울 수 있다면 더 좋습니다.', '#4-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 방화벽을 다시 닫기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer3', '방화벽을 다시 닫기', '오답! 방화벽을 닫으면 다른 사람들이 갇힐 수 있습니다. 열어두어야 합니다.', '#4-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 훈련 복습하고 가족과 공유
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer1', '훈련 복습하고 가족과 공유', '정답! 화재 대응 방법을 복습하며, 미래의 재난에 대비하는 것이 중요합니다. 가족의 안전을 위한 따뜻한 마음입니다.', '#END', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 다시 시작하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer2', '다시 시작하기', '좋은 선택! 다시 훈련을 시작하여 더 강해집니다. 화재 대응 능력을 향상시키는 도전의 마음입니다.', '#1-1', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 화상 부위를 흐르는 찬물에 10-15분간 담그기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer1', '화상 부위를 흐르는 찬물에 10-15분간 담그기', '정답! 화상 부위를 찬물로 냉각시키는 것이 가장 중요한 응급처치입니다. 통증이 완화되고 추가 손상을 방지할 수 있습니다.', '#1-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 바로 연고나 로션을 바르기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer2', '바로 연고나 로션을 바르기', '오답! 화상 부위에 연고나 로션을 바르면 열이 밖으로 나가지 못해 더 큰 손상을 입을 수 있습니다. 먼저 냉각 처치가 필요합니다.', '#1-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 얼음을 직접 화상 부위에 대기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer3', '얼음을 직접 화상 부위에 대기', '오답! 얼음을 직접 대면 동상에 걸릴 수 있고, 화상 부위를 더 손상시킬 수 있습니다. 흐르는 찬물이 더 안전합니다.', '#1-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 깨끗한 거즈로 화상 부위를 덮고 병원으로 이송
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer1', '깨끗한 거즈로 화상 부위를 덮고 병원으로 이송', '정답! 화상 부위를 깨끗한 거즈로 덮어 감염을 방지하고, 전문의의 치료를 받는 것이 중요합니다.', '#2-1', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 물집을 터뜨리고 상처 부위 청소하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer2', '물집을 터뜨리고 상처 부위 청소하기', '오답! 물집을 터뜨리면 감염의 위험이 높아집니다. 물집은 자연스럽게 낫도록 두어야 합니다.', '#2-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 화상 부위에 붙어있는 옷을 강제로 떼어내기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer3', '화상 부위에 붙어있는 옷을 강제로 떼어내기', '오답! 화상 부위에 붙어있는 물질을 강제로 떼어내면 피부가 함께 벗겨져 더 큰 상처를 만들 수 있습니다.', '#2-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 시원한 장소로 옮기고 옷을 벗기며 이온음료나 물을 마시...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer1', '시원한 장소로 옮기고 옷을 벗기며 이온음료나 물을 마시게 하기', '정답! 일사병 환자를 시원한 곳으로 옮기고 체온을 낮추며 수분을 보충하는 것이 가장 중요한 처치입니다.', '#2-2', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 더운 곳에서 계속 휴식시키기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer2', '더운 곳에서 계속 휴식시키기', '오답! 더운 곳에서 계속 있으면 체온이 더 올라가 일사병이 악화될 수 있습니다. 반드시 시원한 곳으로 옮겨야 합니다.', '#2-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 의식이 없어도 강제로 물을 마시게 하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer3', '의식이 없어도 강제로 물을 마시게 하기', '오답! 의식이 없는 환자에게 물을 강제로 마시게 하면 기도에 물이 들어가 질식할 수 있습니다. 의식이 있을 때만 수분을 보충해야 합니다.', '#2-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 119에 신고하고 젖은 수건으로 체온을 급격히 낮추며 ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer1', '119에 신고하고 젖은 수건으로 체온을 급격히 낮추며 병원으로 이송', '정답! 열사병은 생명을 위협하는 응급상황이므로 즉시 119에 신고하고 체온을 낮춘 후 병원으로 이송해야 합니다.', '#3-1', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 집에서 휴식시키며 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer2', '집에서 휴식시키며 기다리기', '오답! 열사병은 시간이 지날수록 뇌와 내장기관에 손상을 줄 수 있어 즉시 의료진의 도움이 필요합니다.', '#3-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 얼음물에 바로 담그기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer3', '얼음물에 바로 담그기', '오답! 체온을 급격히 낮추면 혈관이 수축하여 오히려 체온 조절이 어려워질 수 있습니다. 젖은 수건으로 천천히 식혀야 합니다.', '#3-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 신용카드로 벌침을 밀어서 제거하고 비누와 물로 씻기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer1', '신용카드로 벌침을 밀어서 제거하고 비누와 물로 씻기', '정답! 벌침을 핀셋으로 뽑으면 독이 더 들어갈 수 있으므로 카드로 밀어서 제거하는 것이 안전합니다.', '#3-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 핀셋으로 벌침을 뽑기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer2', '핀셋으로 벌침을 뽑기', '오답! 핀셋으로 벌침을 뽑으면 벌침에 남은 독이 더 많이 피부에 들어가게 됩니다. 카드로 밀어서 제거해야 합니다.', '#3-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 벌침을 그대로 두고 병원으로 가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer3', '벌침을 그대로 두고 병원으로 가기', '부분 정답! 벌침을 제거하지 않으면 독이 계속 들어가므로 먼저 제거한 후 병원으로 가는 것이 좋습니다.', '#3-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 얼음주머니로 냉찜질하고 알레르기 반응 확인 후 필요시 ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer1', '얼음주머니로 냉찜질하고 알레르기 반응 확인 후 필요시 병원 이송', '정답! 냉찜질로 통증과 부종을 완화하고, 알레르기 반응이 있으면 즉시 병원으로 이송해야 합니다.', '#4-1', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 상처에 소독약을 바르기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer2', '상처에 소독약을 바르기', '오답! 벌에 쏘인 상처에는 소독약보다는 냉찜질이 더 효과적입니다. 소독약은 오히려 자극을 줄 수 있습니다.', '#4-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 상처를 문지르며 독을 빼내기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer3', '상처를 문지르며 독을 빼내기', '오답! 상처를 문지르면 독이 더 퍼지고 염증이 악화될 수 있습니다. 냉찜질로 부종을 완화하는 것이 좋습니다.', '#4-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 119에 신고하고 물린 부위를 심장보다 낮게 위치시키며...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer1', '119에 신고하고 물린 부위를 심장보다 낮게 위치시키며 비누와 물로 씻기', '정답! 뱀에 물렸을 때는 즉시 119에 신고하고, 독의 확산을 늦추기 위해 물린 부위를 심장보다 낮게 위치시켜야 합니다.', '#4-2', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 상처를 칼로 절개하여 독을 빼내기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer2', '상처를 칼로 절개하여 독을 빼내기', '오답! 상처를 칼로 절개하면 혈관이나 신경을 손상시킬 수 있고, 2차 감염의 위험이 높아집니다. 절대 하지 말아야 할 처치입니다.', '#4-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 상처에 담뱃재나 된장을 바르기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer3', '상처에 담뱃재나 된장을 바르기', '오답! 민간요법인 담뱃재나 된장을 바르면 오히려 감염을 일으킬 수 있습니다. 비누와 물로 씻는 것이 가장 안전합니다.', '#4-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 물린 부위 10cm 위쪽을 폭 2cm 이상의 헝겊으로 ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer1', '물린 부위 10cm 위쪽을 폭 2cm 이상의 헝겊으로 느슨하게 묶기', '정답! 물린 부위 위쪽을 느슨하게 묶어 독의 확산을 늦추되, 혈액순환을 막지 않도록 손가락 하나가 들어갈 정도로 느슨하게 묶어야 합니다.', '#5-1', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 물린 부위를 꽉 조여서 묶기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer2', '물린 부위를 꽉 조여서 묶기', '오답! 너무 꽉 조이면 혈액순환이 차단되어 조직이 괴사할 수 있습니다. 느슨하게 묶어야 합니다.', '#5-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 묶지 않고 그대로 두기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer3', '묶지 않고 그대로 두기', '오답! 묶지 않으면 독이 빠르게 전신으로 퍼져 더 위험해질 수 있습니다. 적절히 묶어서 확산을 늦춰야 합니다.', '#5-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 하임리히법(복부 밀어올리기)을 실시하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer1', '하임리히법(복부 밀어올리기)을 실시하기', '정답! 기도폐쇄 시 하임리히법을 사용하여 이물질을 제거하는 것이 가장 효과적인 응급처치입니다.', '#5-2', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 환자의 등을 두드리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer2', '환자의 등을 두드리기', '오답! 등을 두드리면 이물질이 더 깊숙이 들어갈 수 있습니다. 하임리히법이 더 안전하고 효과적입니다.', '#5-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 물을 마시게 하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer3', '물을 마시게 하기', '오답! 기도폐쇄 시 물을 마시게 하면 이물질이 더 깊숙이 들어가거나 질식할 수 있습니다. 하임리히법을 먼저 시도해야 합니다.', '#5-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 환자 뒤에 서서 두 손을 명치와 배꼽 중앙에 놓고 주먹...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer1', '환자 뒤에 서서 두 손을 명치와 배꼽 중앙에 놓고 주먹을 감싸 쥐고 세게 밀어 올리기', '정답! 하임리히법의 올바른 자세입니다. 환자 뒤에서 명치와 배꼽 중앙에 손을 놓고 세게 밀어 올려 이물질을 제거합니다.', '#END', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 환자 앞에서 가슴을 두드리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer2', '환자 앞에서 가슴을 두드리기', '오답! 가슴을 두드리는 것은 하임리히법이 아닙니다. 복부를 밀어 올려야 이물질이 제거됩니다.', '#END', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 환자 옆에서 팔을 잡고 흔들기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer3', '환자 옆에서 팔을 잡고 흔들기', '오답! 팔을 흔드는 것으로는 기도폐쇄를 해결할 수 없습니다. 복부를 밀어 올리는 하임리히법이 필요합니다.', '#END', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 안전한 곳으로 대피한 후 119에 신고하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer1', '안전한 곳으로 대피한 후 119에 신고하기', '정답! 교통사고 발생 시 가장 먼저 자신의 안전을 확보한 후 119에 신고하는 것이 우선순위입니다.', '#1-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 바로 부상자를 차량에서 꺼내기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer2', '바로 부상자를 차량에서 꺼내기', '오답! 부상자를 함부로 움직이면 척추나 목 부상을 악화시킬 수 있습니다. 먼저 안전을 확보하고 신고해야 합니다.', '#1-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 사고 현장에서 차량을 그대로 두고 상황 파악하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer3', '사고 현장에서 차량을 그대로 두고 상황 파악하기', '오답! 사고 현장에 그대로 있으면 2차 사고의 위험이 있습니다. 먼저 안전한 곳으로 대피해야 합니다.', '#1-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 비상깜빡이 켜고 갓길로 이동한 후 삼각대 설치하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer1', '비상깜빡이 켜고 갓길로 이동한 후 삼각대 설치하기', '정답! 비상깜빡이로 다른 차량에 경고하고, 갓길로 이동하여 2차 사고를 방지한 후 삼각대를 설치하는 것이 올바른 순서입니다.', '#1-3', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 삼각대만 설치하고 차량은 그대로 두기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer2', '삼각대만 설치하고 차량은 그대로 두기', '오답! 차량이 움직일 수 있다면 갓길로 이동하여 2차 사고를 방지하는 것이 더 중요합니다. 삼각대만으로는 충분하지 않습니다.', '#1-3', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 차량만 이동하고 삼각대 설치하지 않기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer3', '차량만 이동하고 삼각대 설치하지 않기', '오답! 차량을 이동한 후에도 삼각대를 설치하여 다른 차량들에게 사고 상황을 알려야 합니다.', '#1-3', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 부상자를 건드리지 말고 구조대 도착을 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer1', '부상자를 건드리지 말고 구조대 도착을 기다리기', '정답! 교통사고 부상자는 척추나 목 부상 가능성이 높아 함부로 움직이면 안 됩니다. 구조대의 전문적인 처치를 기다려야 합니다.', '#2-1', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 부상자를 차량에서 꺼내어 안전한 곳으로 옮기기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer2', '부상자를 차량에서 꺼내어 안전한 곳으로 옮기기', '오답! 부상자를 움직이면 척추나 목 부상을 악화시킬 수 있습니다. 화재가 발생한 경우가 아니라면 건드리지 말아야 합니다.', '#2-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 부상자의 상태를 확인하기 위해 차량 문을 열기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer3', '부상자의 상태를 확인하기 위해 차량 문을 열기', '부분 정답! 부상자 상태 확인은 필요하지만, 차량 문을 열 때는 부상자의 안전을 고려하여 신중하게 해야 합니다.', '#2-1', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 비상통화장치를 눌러 승무원과 연락하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer1', '비상통화장치를 눌러 승무원과 연락하기', '정답! 지하철 화재 시 가장 먼저 비상통화장치로 승무원에게 상황을 알리고 지시를 받는 것이 중요합니다.', '#2-2', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 바로 소화기로 불을 끄기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer2', '바로 소화기로 불을 끄기', '오답! 소화기 사용 전에 먼저 승무원에게 상황을 알리고 지시를 받아야 합니다. 무작정 소화기를 사용하면 위험할 수 있습니다.', '#2-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 바로 비상구로 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer3', '바로 비상구로 대피하기', '오답! 승무원의 지시 없이 무작정 대피하면 더 위험한 상황에 빠질 수 있습니다. 먼저 승무원과 연락해야 합니다.', '#2-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 비상열림 장치를 사용하여 출입문을 열고 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer1', '비상열림 장치를 사용하여 출입문을 열고 대피하기', '정답! 출입문이 열리지 않을 때는 비상열림 장치를 사용하여 문을 열고 대피해야 합니다.', '#2-3', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 유리창을 깨고 창문으로 탈출하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer2', '유리창을 깨고 창문으로 탈출하기', '오답! 지하철은 유리창을 깨면 위험하고, 비상열림 장치가 더 안전한 방법입니다.', '#2-3', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 출입문을 발로 차서 열기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer3', '출입문을 발로 차서 열기', '오답! 출입문을 발로 차면 부상을 입을 수 있고, 비상열림 장치를 사용하는 것이 올바른 방법입니다.', '#2-3', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 코와 입을 손수건으로 막고 걸어서 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-3, @scenario_id_#2, 'answer1', '코와 입을 손수건으로 막고 걸어서 대피하기', '정답! 연기를 피하기 위해 코와 입을 막고, 뛰면 위험하므로 걸어서 대피하는 것이 안전합니다.', '#3-1', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 숨을 참고 뛰어서 빠르게 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-3, @scenario_id_#2, 'answer2', '숨을 참고 뛰어서 빠르게 대피하기', '오답! 뛰어서 대피하면 넘어지거나 다른 사람과 부딪힐 수 있어 위험합니다. 걸어서 대피해야 합니다.', '#3-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 연기를 무시하고 그냥 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-3, @scenario_id_#2, 'answer3', '연기를 무시하고 그냥 대피하기', '오답! 연기를 들이마시면 중독될 수 있으므로 반드시 코와 입을 막고 대피해야 합니다.', '#3-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 안전벨트를 풀고 문이 열리는지 확인하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer1', '안전벨트를 풀고 문이 열리는지 확인하기', '정답! 물에 빠진 차량에서는 안전벨트를 먼저 풀고, 문이 열리는지 확인하는 것이 가장 중요합니다.', '#3-2', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 바로 유리창을 깨고 탈출하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer2', '바로 유리창을 깨고 탈출하기', '오답! 먼저 안전벨트를 풀고 문이 열리는지 확인해야 합니다. 문이 열리면 유리창을 깰 필요가 없습니다.', '#3-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 차량이 완전히 가라앉을 때까지 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer3', '차량이 완전히 가라앉을 때까지 기다리기', '오답! 차량이 가라앉으면 탈출이 더 어려워집니다. 가능한 한 빨리 탈출을 시도해야 합니다.', '#3-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 망치나 단단한 물건으로 유리창을 깨고 탈출하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer1', '망치나 단단한 물건으로 유리창을 깨고 탈출하기', '정답! 문이 열리지 않을 때는 유리창을 깨고 탈출하는 것이 가장 확실한 방법입니다.', '#3-3', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 차량이 완전히 가라앉아서 압력이 같아질 때까지 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer2', '차량이 완전히 가라앉아서 압력이 같아질 때까지 기다리기', '부분 정답! 압력이 같아지면 문이 열릴 수 있지만, 시간이 오래 걸려 위험할 수 있습니다. 유리창을 깨는 것이 더 빠릅니다.', '#3-3', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 문을 발로 차서 열기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer3', '문을 발로 차서 열기', '오답! 물의 압력으로 문을 발로 차서 열기는 거의 불가능합니다. 유리창을 깨는 것이 더 효과적입니다.', '#3-3', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 3-4회 심호흡을 하고 큰 숨을 들이쉰 후 탈출하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-3, @scenario_id_#3, 'answer1', '3-4회 심호흡을 하고 큰 숨을 들이쉰 후 탈출하기', '정답! 물속에서 더 오래 견딜 수 있도록 심호흡으로 산소를 충분히 공급받은 후 탈출하는 것이 중요합니다.', '#4-1', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 바로 숨을 멈추고 탈출하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-3, @scenario_id_#3, 'answer2', '바로 숨을 멈추고 탈출하기', '오답! 충분한 산소 공급 없이 탈출하면 물속에서 의식을 잃을 수 있습니다. 심호흡이 필요합니다.', '#4-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 빠르게 호흡하며 탈출하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-3, @scenario_id_#3, 'answer3', '빠르게 호흡하며 탈출하기', '오답! 빠른 호흡은 오히려 산소를 낭비할 수 있습니다. 깊고 천천히 호흡하는 것이 효과적입니다.', '#4-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 차량의 진행 유무를 확인한 후 안전할 때 건너기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer1', '차량의 진행 유무를 확인한 후 안전할 때 건너기', '정답! 신호가 바뀌어도 차량이 완전히 멈추었는지 확인하고 안전할 때 건너는 것이 중요합니다.', '#4-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 파란 신호이므로 바로 건너기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer2', '파란 신호이므로 바로 건너기', '오답! 파란 신호라도 차량이 완전히 멈추지 않았을 수 있으므로 반드시 차량의 진행 상황을 확인해야 합니다.', '#4-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 다음 신호까지 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer3', '다음 신호까지 기다리기', '부분 정답! 안전을 위해 기다리는 것도 좋지만, 차량이 멈추었다면 안전하게 건널 수 있습니다.', '#4-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 사고 지점에서 즉시 멀리 떨어져 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer1', '사고 지점에서 즉시 멀리 떨어져 대피하기', '정답! 위험물질 수송차량 사고는 대형사고로 이어질 수 있으므로 즉시 사고 지점에서 멀리 떨어져 대피해야 합니다.', '#END', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 사고 상황을 확인하기 위해 가까이 가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer2', '사고 상황을 확인하기 위해 가까이 가기', '오답! 위험물질 사고 현장에 가까이 가면 유독가스나 폭발의 위험이 있습니다. 즉시 대피해야 합니다.', '#END', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 119에 신고만 하고 그 자리에 있기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer3', '119에 신고만 하고 그 자리에 있기', '오답! 신고는 중요하지만, 위험물질 사고에서는 신고 후에도 즉시 대피해야 합니다.', '#END', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 탁자 아래로 들어가 탁자 다리를 꼭 잡기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer1', '탁자 아래로 들어가 탁자 다리를 꼭 잡기', '정답! 지진으로 흔들리는 동안은 탁자 아래로 들어가 몸을 보호하고 탁자 다리를 꼭 잡아야 합니다.', '#1-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 바로 밖으로 뛰어나가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer2', '바로 밖으로 뛰어나가기', '오답! 지진이 발생하면 먼저 안전한 곳으로 몸을 보호해야 합니다. 밖으로 나가면 떨어지는 물건에 맞을 수 있습니다.', '#1-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 엘리베이터를 타고 내려가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-1, @scenario_id_#1, 'answer3', '엘리베이터를 타고 내려가기', '오답! 지진 시 엘리베이터는 정전될 수 있고 위험합니다. 탁자 아래로 들어가 몸을 보호해야 합니다.', '#1-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 전기와 가스를 차단하고 문을 열어 출구를 확보한 후 밖...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer1', '전기와 가스를 차단하고 문을 열어 출구를 확보한 후 밖으로 나가기', '정답! 흔들림이 멈추면 전기와 가스를 차단하고 문을 열어 출구를 확보한 후 밖으로 나가야 합니다.', '#1-3', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 바로 밖으로 나가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer2', '바로 밖으로 나가기', '부분 정답! 하지만 먼저 전기와 가스를 차단하고 출구를 확보해야 합니다.', '#1-3', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 집안을 정리하고 나가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-2, @scenario_id_#1, 'answer3', '집안을 정리하고 나가기', '오답! 지진 후에는 안전을 우선으로 해야 합니다. 집안 정리는 나중에 하고 먼저 대피해야 합니다.', '#1-3', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 떨어지는 물건에 대비하여 가방이나 손으로 머리를 보호하...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer1', '떨어지는 물건에 대비하여 가방이나 손으로 머리를 보호하며 건물과 거리를 두고 운동장이나 공원 등 넓은 공간으로 대피하기', '정답! 집밖에 있을 때는 떨어지는 물건에 대비하여 가방이나 손으로 머리를 보호하며 건물과 거리를 두고 운동장이나 공원 등 넓은 공간으로 대피해야 합니다.', '#2-1', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 차량을 타고 집으로 돌아가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer2', '차량을 타고 집으로 돌아가기', '오답! 지진 시 차량 이용은 금지입니다. 도로가 막힐 수 있고 위험합니다.', '#2-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 건물 근처에서 상황을 지켜보기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer3', '건물 근처에서 상황을 지켜보기', '오답! 건물 근처에 있으면 여진이나 건물 붕괴 위험이 있습니다. 안전한 곳으로 대피해야 합니다.', '#2-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 책상 아래로 들어가 책상 다리를 꼭 잡기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer1', '책상 아래로 들어가 책상 다리를 꼭 잡기', '정답! 학교에 있을 때는 책상 아래로 들어가 책상 다리를 꼭 잡아야 합니다.', '#2-2', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 바로 교실 밖으로 나가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer2', '바로 교실 밖으로 나가기', '오답! 지진이 발생하면 먼저 안전한 곳으로 몸을 보호해야 합니다. 밖으로 나가면 떨어지는 물건에 맞을 수 있습니다.', '#2-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 창문으로 뛰어내리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-1, @scenario_id_#2, 'answer3', '창문으로 뛰어내리기', '오답! 창문으로 뛰어내리면 다칠 수 있습니다. 책상 아래로 들어가 몸을 보호해야 합니다.', '#2-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 질서를 지키며 운동장으로 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer1', '질서를 지키며 운동장으로 대피하기', '정답! 흔들림이 멈추면 질서를 지키며 운동장으로 대피해야 합니다.', '#3-1', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 각자 알아서 집으로 돌아가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer2', '각자 알아서 집으로 돌아가기', '오답! 학교에서는 질서를 지키며 함께 운동장으로 대피해야 합니다. 각자 돌아가면 위험할 수 있습니다.', '#3-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 교실에 그대로 있기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#2-2, @scenario_id_#2, 'answer3', '교실에 그대로 있기', '오답! 흔들림이 멈추면 안전한 곳인 운동장으로 대피해야 합니다.', '#3-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 책상 아래로 들어가 책상 다리를 꼭 잡기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer1', '책상 아래로 들어가 책상 다리를 꼭 잡기', '정답! 빌딩에서 지진이 발생하면 책상 아래로 들어가 책상 다리를 꼭 잡아야 합니다.', '#3-2', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 바로 계단으로 뛰어가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer2', '바로 계단으로 뛰어가기', '오답! 지진이 발생하면 먼저 안전한 곳으로 몸을 보호해야 합니다. 흔들리는 동안 계단으로 가면 위험합니다.', '#3-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 엘리베이터를 타고 내려가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-1, @scenario_id_#3, 'answer3', '엘리베이터를 타고 내려가기', '오답! 지진 시 엘리베이터는 정전될 수 있고 위험합니다. 책상 아래로 들어가 몸을 보호해야 합니다.', '#3-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 계단을 이용하여 신속하게 건물 밖으로 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer1', '계단을 이용하여 신속하게 건물 밖으로 대피하기', '정답! 빌딩에서 흔들림이 멈추면 계단을 이용하여 신속하게 건물 밖으로 대피해야 합니다. 엘리베이터는 사용하면 안 됩니다.', '#4-1', 10, 10, 125, 1, 1, NOW());

-- 선택 옵션 생성: 엘리베이터를 타고 내려가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer2', '엘리베이터를 타고 내려가기', '오답! 지진 시 엘리베이터는 정전될 수 있고 위험합니다. 계단을 이용해야 합니다.', '#4-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 창문으로 뛰어내리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#3-2, @scenario_id_#3, 'answer3', '창문으로 뛰어내리기', '오답! 창문으로 뛰어내리면 다칠 수 있습니다. 계단을 이용하여 안전하게 내려가야 합니다.', '#4-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 모든 층의 버튼을 눌러 가장 먼저 열리는 층에서 내린 ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer1', '모든 층의 버튼을 눌러 가장 먼저 열리는 층에서 내린 후 계단을 이용하기', '정답! 엘리베이터에 있을 때는 모든 층의 버튼을 눌러 가장 먼저 열리는 층에서 내린 후 계단을 이용해야 합니다.', '#4-2', 10, 10, 150, 1, 1, NOW());

-- 선택 옵션 생성: 엘리베이터 안에서 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer2', '엘리베이터 안에서 기다리기', '오답! 엘리베이터 안에서 기다리면 정전될 수 있고 위험합니다. 모든 층의 버튼을 눌러 내려야 합니다.', '#4-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 비상정지 버튼을 누르기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-1, @scenario_id_#4, 'answer3', '비상정지 버튼을 누르기', '부분 정답! 하지만 비상정지보다는 모든 층의 버튼을 눌러 내리는 것이 더 안전합니다.', '#4-2', 5, 5, 50, 1, 1, NOW());

-- 선택 옵션 생성: 계단을 이용하여 안전한 곳으로 대피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer1', '계단을 이용하여 안전한 곳으로 대피하기', '정답! 엘리베이터에서 내린 후에는 계단을 이용하여 안전한 곳으로 대피해야 합니다.', '#5-1', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 다시 엘리베이터를 타기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer2', '다시 엘리베이터를 타기', '오답! 지진 시 엘리베이터는 위험합니다. 계단을 이용해야 합니다.', '#5-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 그 자리에서 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#4-2, @scenario_id_#4, 'answer3', '그 자리에서 기다리기', '오답! 안전한 곳으로 대피해야 합니다. 계단을 이용하여 밖으로 나가야 합니다.', '#5-1', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 라디오나 공공기관의 안내 방송 등 올바른 정보에 따라 ...
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer1', '라디오나 공공기관의 안내 방송 등 올바른 정보에 따라 행동하기', '정답! 대피 장소에 도착한 후에는 라디오나 공공기관의 안내 방송 등 올바른 정보에 따라 행동해야 합니다.', '#5-2', 10, 10, 75, 1, 1, NOW());

-- 선택 옵션 생성: 바로 집으로 돌아가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer2', '바로 집으로 돌아가기', '오답! 지진 후에는 올바른 정보를 확인한 후 귀가 여부를 결정해야 합니다.', '#5-2', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 주변 사람들과 이야기하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-1, @scenario_id_#5, 'answer3', '주변 사람들과 이야기하기', '부분 정답! 하지만 먼저 라디오나 공공기관의 안내 방송을 들어야 합니다.', '#5-2', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 가족의 상황과 부상자를 살펴보고 즉시 구조 요청하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer1', '가족의 상황과 부상자를 살펴보고 즉시 구조 요청하기', '정답! 흔들림이 멈추면 함께 있는 가족끼리 부상이 없는지 확인하고, 부상자가 있으면 이웃과 서로 협력하여 응급처치하고 소방서(119) 등 구조구급기관에 신고해야 합니다.', '#5-3', 10, 10, 100, 1, 1, NOW());

-- 선택 옵션 생성: 바로 집으로 돌아가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer2', '바로 집으로 돌아가기', '오답! 먼저 가족의 상황과 부상자를 확인해야 합니다.', '#5-3', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 상황을 더 지켜보기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-2, @scenario_id_#5, 'answer3', '상황을 더 지켜보기', '부분 정답! 하지만 가족의 상황과 부상자를 먼저 확인해야 합니다.', '#5-3', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 훈련 내용을 복습하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-3, @scenario_id_#5, 'answer1', '훈련 내용을 복습하기', '정답! 훈련 내용을 복습하여 실제 상황에 대비해야 합니다.', '#END', 10, 10, 50, 1, 1, NOW());

-- 선택 옵션 생성: 훈련을 다시 시작하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#5-3, @scenario_id_#5, 'answer2', '훈련을 다시 시작하기', '좋은 선택! 반복 훈련으로 더욱 익숙해질 수 있습니다.', '#1-1', 5, 5, 25, 1, 1, NOW());

COMMIT;

-- 배치 삽입 완료