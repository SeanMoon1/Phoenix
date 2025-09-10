-- 시나리오 생성: 아파트 화재 경보
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'SCEN001', '아파트 화재 경보', '새벽 3시, 평화롭게 잠들어 있던 중 갑자기 날카로운 화재 경보가 울려 퍼집니다. 창문 밖으로 연기가 보이고, 복도에서 다른 주민들의 발걸음 소리가 들립니다. 아래층에서 화재가 발생한 것 같습니다. 가족의 안전이 걱정됩니다.', 'fire', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_SCEN001 = LAST_INSERT_ID();

-- 시나리오 생성: 출입문 손잡이와 연기 확인
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'FIR582957', '출입문 손잡이와 연기 확인', '심장이 터질 듯 뛰는 가운데, 문 앞에 선 당신. 복도에서 다른 주민들의 발걸음 소리가 들리고, 연기 냄새가 더 진해집니다. 손이 떨리고, 땀이 흘러내립니다. 가족의 안전이 걱정됩니다.', 'fire', 'MEDIUM', 'easy', 'ACTIVE', 1, NOW());
SET @scenario_id_FIR582957 = LAST_INSERT_ID();

-- 시나리오 생성: 완강기와 추락 위기
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (1, 'FIR582958', '완강기와 추락 위기', '대피 공간이 막혔습니다. 완강기를 쥐자 손이 미끄러지고, 아래에서 다른 주민들의 소리가 들립니다. 바람이 얼굴을 때립니다.', 'fire', 'MEDIUM', 'hard', 'ACTIVE', 1, NOW());
SET @scenario_id_FIR582958 = LAST_INSERT_ID();

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