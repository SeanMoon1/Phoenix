import type { ScriptBlock, Scenario } from '../types';

const LOCAL_STORAGE_ID = 'me.phoenix.game-script-tool';
const SCENARIO_STORAGE_ID = 'me.phoenix.game-script-tool-scenarios';

// 기존 ScriptBlock API (하위 호환성)
export const loadBlockList = (): ScriptBlock[] => {
  let cachedBlockList: ScriptBlock[];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_ID);
    cachedBlockList = stored ? JSON.parse(stored) : [];
    if (cachedBlockList === null) cachedBlockList = [];
  } catch {
    cachedBlockList = [];
  }
  return cachedBlockList;
};

export const saveBlockList = (blockList: ScriptBlock[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ID, JSON.stringify(blockList));
  } catch {
    alert('자동 저장 중 문제 발생');
  }
};

// 새로운 시나리오 기반 API
export const loadScenarios = (): Scenario[] => {
  let cachedScenarios: Scenario[];
  try {
    const stored = localStorage.getItem(SCENARIO_STORAGE_ID);
    cachedScenarios = stored ? JSON.parse(stored) : [];
    if (cachedScenarios === null) cachedScenarios = [];
  } catch {
    cachedScenarios = [];
  }
  return cachedScenarios;
};

export const saveScenarios = (scenarios: Scenario[]): void => {
  try {
    localStorage.setItem(SCENARIO_STORAGE_ID, JSON.stringify(scenarios));
  } catch {
    alert('시나리오 저장 중 문제 발생');
  }
};

// 기존 exportScript (하위 호환성)
export const exportScript = (blockList: ScriptBlock[]): void => {
  try {
    // 실제 DB 스키마로 변환
    const dbData = {
      scenarios: [
        {
          scenario_id: 1,
          team_id: 1,
          scenario_code: 'SCEN001',
          title: '재난 대응 훈련 시나리오',
          disaster_type: blockList[0]?.disasterType || 'fire',
          description: '재난 대응 훈련을 위한 시나리오',
          risk_level: blockList[0]?.difficulty || 'medium',
          occurrence_condition: '',
          status: '임시저장',
          approval_comment: '',
          image_url: '',
          video_url: '',
          created_at: new Date().toISOString(),
          created_by: 1,
          approved_at: null,
          approved_by: null,
          updated_at: new Date().toISOString(),
          updated_by: 1,
          deleted_at: null,
          is_active: 1,
        },
      ],

      events: blockList.map((block, index) => ({
        event_id: index + 1,
        scenario_id: 1,
        event_code: block.sceneId,
        event_order: index + 1,
        event_description: block.title || '',
        event_type: 'CHOICE',
        created_at: block.createdAt,
        created_by: 1,
        updated_at: block.updatedAt || new Date().toISOString(),
        updated_by: 1,
        deleted_at: null,
        is_active: 1,
      })),

      choices: blockList.flatMap((block, blockIndex) =>
        (block.options || []).map((option, optionIndex) => ({
          choice_id: blockIndex * 100 + optionIndex + 1,
          event_id: blockIndex + 1,
          scenario_id: 1,
          choice_code: option.answerId,
          choice_text: option.answer,
          is_correct: false,
          score_weight: 0,
          next_event_id: option.nextId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: 1,
          deleted_at: null,
          is_active: 1,
        }))
      ),
    };

    // DB 스키마 호환 형식으로 다운로드
    download(
      JSON.stringify(dbData, null, 2),
      `db_schema_compatible_${new Date().toISOString().split('T')[0]}`,
      'json'
    );
  } catch {
    alert('DB 스키마 변환 중 문제가 발생했습니다.');
  }
};

// 새로운 시나리오 export
export const exportScenarios = (scenarios: Scenario[]): void => {
  try {
    download(
      JSON.stringify(scenarios, null, 2),
      `scenarios_${new Date().toISOString().split('T')[0]}`,
      'json'
    );
  } catch {
    alert('시나리오 export 중 문제가 발생했습니다.');
  }
};

export const importScript = (callback: (data: ScriptBlock[]) => void): void => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt,text/plain';
    input.click();
    input.onchange = function (event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        processFile(target.files[0]);
      }
    };

    function processFile(file: File): void {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = function () {
        try {
          const result = reader.result as string;
          const parsed = JSON.parse(result);

          // import된 데이터를 ScriptBlock 형식으로 변환
          const convertedData: ScriptBlock[] = parsed.map(
            (item: Record<string, unknown>) => ({
              sceneId: item.sceneId as string,
              title: item.title as string,
              content: item.content as string,
              sceneScript: item.sceneScript as string,
              approvalStatus: (item.approvalStatus as string) || 'DRAFT',
              createdAt: (item.createdAt as string) || new Date().toISOString(),
              createdBy: (item.createdBy as string) || 'Imported User',
              order: (item.order as number) || Date.now(),
              disasterType: item.disasterType as string,
              difficulty: item.difficulty as string,
              options:
                (item.options as Record<string, unknown>[])?.map(
                  (option: Record<string, unknown>) => ({
                    answerId:
                      (option.answerId as string) ||
                      `answer${Math.floor(Math.random() * 1000)}`,
                    answer: option.answer as string,
                    reaction: option.reaction as string,
                    nextId: option.nextId as string,
                    points: {
                      speed:
                        ((option.points as Record<string, unknown>)
                          ?.speed as number) || 0,
                      accuracy:
                        ((option.points as Record<string, unknown>)
                          ?.accuracy as number) || 0,
                    },
                  })
                ) || [],
            })
          );

          callback(convertedData);
        } catch {
          alert('파일 형식이 올바르지 않습니다.');
        }
      };
    }
  } catch {
    alert('불러오는데 문제가 생겼어요');
  }
};

// 새로운 시나리오 import
export const importScenarios = (callback: (data: Scenario[]) => void): void => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt,text/plain';
    input.click();
    input.onchange = function (event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        processFile(target.files[0]);
      }
    };

    function processFile(file: File): void {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = function () {
        try {
          const result = reader.result as string;
          const parsed = JSON.parse(result);

          // import된 데이터를 Scenario 형식으로 변환
          const convertedData: Scenario[] = parsed.map(
            (item: Record<string, unknown>) => ({
              scenarioId:
                (item.scenarioId as string) || `scenario_${Date.now()}`,
              teamId: (item.teamId as string) || 'team001',
              scenarioCode:
                (item.scenarioCode as string) || `SCEN${Date.now()}`,
              title: (item.title as string) || 'Imported Scenario',
              disasterType: (item.disasterType as string) || 'fire',
              description: (item.description as string) || '',
              riskLevel: (item.riskLevel as string) || 'medium',
              occurrenceCondition: (item.occurrenceCondition as string) || '',
              status: (item.status as string) || '임시저장',
              approvalComment: (item.approvalComment as string) || '',
              imageUrl: (item.imageUrl as string) || '',
              videoUrl: (item.videoUrl as string) || '',
              createdAt: (item.createdAt as string) || new Date().toISOString(),
              createdBy: (item.createdBy as string) || 'Imported User',
              approvedAt: (item.approvedAt as string) || '',
              approvedBy: (item.approvedBy as string) || '',
              updatedAt: (item.updatedAt as string) || '',
              updatedBy: (item.updatedBy as string) || '',
              deletedAt: (item.deletedAt as string) || '',
              isActive:
                (item.isActive as boolean) !== undefined
                  ? (item.isActive as boolean)
                  : true,
              events:
                (item.events as Record<string, unknown>[])?.map(
                  (event: Record<string, unknown>) => ({
                    eventId: (event.eventId as string) || `event_${Date.now()}`,
                    scenarioId:
                      (item.scenarioId as string) || `scenario_${Date.now()}`,
                    eventCode:
                      (event.eventCode as string) || `EVENT${Date.now()}`,
                    eventOrder: (event.eventOrder as number) || 1,
                    eventDescription: (event.eventDescription as string) || '',
                    eventType: (event.eventType as string) || '선택형',
                    createdAt:
                      (event.createdAt as string) || new Date().toISOString(),
                    createdBy: (event.createdBy as string) || 'Imported User',
                    updatedAt: (event.updatedAt as string) || '',
                    updatedBy: (event.updatedBy as string) || '',
                    deletedAt: (event.deletedAt as string) || '',
                    isActive:
                      (event.isActive as boolean) !== undefined
                        ? (event.isActive as boolean)
                        : true,
                    choices:
                      (event.choices as Record<string, unknown>[])?.map(
                        (choice: Record<string, unknown>) => ({
                          choiceId:
                            (choice.choiceId as string) ||
                            `choice_${Date.now()}`,
                          eventId:
                            (event.eventId as string) || `event_${Date.now()}`,
                          scenarioId:
                            (item.scenarioId as string) ||
                            `scenario_${Date.now()}`,
                          choiceCode:
                            (choice.choiceCode as string) ||
                            `CHOICE${Date.now()}`,
                          choiceText: (choice.choiceText as string) || '',
                          isCorrect: (choice.isCorrect as boolean) || false,
                          scoreWeight: (choice.scoreWeight as number) || 0,
                          nextEventId: (choice.nextEventId as string) || '',
                          createdAt:
                            (choice.createdAt as string) ||
                            new Date().toISOString(),
                          updatedAt: (choice.updatedAt as string) || '',
                          updatedBy: (choice.updatedBy as string) || '',
                          deletedAt: (choice.deletedAt as string) || '',
                          isActive:
                            (choice.isActive as boolean) !== undefined
                              ? (choice.isActive as boolean)
                              : true,
                        })
                      ) || [],
                  })
                ) || [],
            })
          );

          callback(convertedData);
        } catch {
          alert('파일 형식이 올바르지 않습니다.');
        }
      };
    }
  } catch {
    alert('시나리오 import 중 문제가 발생했습니다.');
  }
};

function download(data: string, filename: string, type: string): void {
  const file = new Blob([data], {
    type: type === 'json' ? 'application/json' : 'text/plain',
  });

  // Modern browsers only
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = `${filename}.${type}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
