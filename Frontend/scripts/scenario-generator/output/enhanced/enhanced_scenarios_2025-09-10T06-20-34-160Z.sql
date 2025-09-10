-- 시나리오 생성: 아파트 화재 경보
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'SCEN001', '아파트 화재 경보', '새벽 3시, 평화롭게 잠들어 있던 중 갑자기 날카로운 화재 경보가 울려 퍼집니다. 창문 밖으로 연기가 보이고, 복도에서 다른 주민들의 발걸음 소리가 들립니다. 아래층에서 화재가 발생한 것 같습니다. 가족의 안전이 걱정됩니다.', 'fire', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_SCEN001 = LAST_INSERT_ID();

-- 시나리오 생성: 출입문 손잡이와 연기 확인
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'FIR234158', '출입문 손잡이와 연기 확인', '심장이 터질 듯 뛰는 가운데, 문 앞에 선 당신. 복도에서 다른 주민들의 발걸음 소리가 들리고, 연기 냄새가 더 진해집니다. 손이 떨리고, 땀이 흘러내립니다. 가족의 안전이 걱정됩니다.', 'fire', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_FIR234158 = LAST_INSERT_ID();

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

-- 선택 옵션 생성: 창문으로 신호 보내고 도움 기다리기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer3', '창문으로 신호 보내고 도움 기다리기', '부분 정답! 창문으로 신호를 보내는 것은 좋지만, 가능하면 직접 대피하는 것이 더 안전합니다. 시간이 지날수록 상황이 악화될 수 있습니다.', '#1-4', 5, 5, 25, 1, 1, NOW());

-- 선택 옵션 생성: 엘리베이터로 빠르게 내려가기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer2', '엘리베이터로 빠르게 내려가기', '오답! 화재 시에는 엘리베이터를 사용하면 안 됩니다. 정전되거나 연기에 가득 찰 수 있어 매우 위험합니다.', '#1-4', 0, 0, 0, 0, 1, NOW());

-- 선택 옵션 생성: 비상계단으로 내려가며 연기를 피하기
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_#1-3, @scenario_id_#1, 'answer1', '비상계단으로 내려가며 연기를 피하기', '정답! 비상계단은 화재 시 가장 안전한 대피 경로입니다. 연기를 피하며 낮은 자세로 대피하세요.', '#1-4', 10, 10, 75, 1, 1, NOW());