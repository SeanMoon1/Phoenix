import { create } from 'zustand';
import type {
  ScriptBlock,
  Scenario,
  DecisionEvent,
  ChoiceOption,
  AppState as AppStateType,
} from '../types';

// 기존 ScriptBlock 스토어 (하위 호환성)
interface BlockListStore {
  blockList: ScriptBlock[];
  setBlockList: (blockList: ScriptBlock[]) => void;
  addBlock: (block: ScriptBlock) => void;
  updateBlock: (sceneId: string, updates: Partial<ScriptBlock>) => void;
  removeBlock: (sceneId: string) => void;
}

export const useBlockListStore = create<BlockListStore>(set => ({
  blockList: [],
  setBlockList: blockList => set({ blockList }),
  addBlock: block => set(state => ({ blockList: [...state.blockList, block] })),
  updateBlock: (sceneId, updates) =>
    set(state => ({
      blockList: state.blockList.map(block =>
        block.sceneId === sceneId ? { ...block, ...updates } : block
      ),
    })),
  removeBlock: sceneId =>
    set(state => ({
      blockList: state.blockList.filter(block => block.sceneId !== sceneId),
    })),
}));

// 새로운 시나리오 기반 스토어
interface ScenarioStore {
  scenarios: Scenario[];
  setScenarios: (scenarios: Scenario[]) => void;
  addScenario: (scenario: Scenario) => void;
  updateScenario: (scenarioId: string, updates: Partial<Scenario>) => void;
  removeScenario: (scenarioId: string) => void;
  addEvent: (scenarioId: string, event: DecisionEvent) => void;
  updateEvent: (
    scenarioId: string,
    eventId: string,
    updates: Partial<DecisionEvent>
  ) => void;
  removeEvent: (scenarioId: string, eventId: string) => void;
  addChoice: (
    scenarioId: string,
    eventId: string,
    choice: ChoiceOption
  ) => void;
  updateChoice: (
    scenarioId: string,
    eventId: string,
    choiceId: string,
    updates: Partial<ChoiceOption>
  ) => void;
  removeChoice: (scenarioId: string, eventId: string, choiceId: string) => void;
}

export const useScenarioStore = create<ScenarioStore>(set => ({
  scenarios: [],
  setScenarios: scenarios => set({ scenarios }),
  addScenario: scenario =>
    set(state => ({ scenarios: [...state.scenarios, scenario] })),
  updateScenario: (scenarioCode, updates) =>
    set(state => ({
      scenarios: state.scenarios.map(scenario =>
        scenario.scenarioCode === scenarioCode
          ? { ...scenario, ...updates }
          : scenario
      ),
    })),
  removeScenario: scenarioCode =>
    set(state => ({
      scenarios: state.scenarios.filter(
        scenario => scenario.scenarioCode !== scenarioCode
      ),
    })),
  addEvent: (scenarioCode, event) =>
    set(state => ({
      scenarios: state.scenarios.map(scenario =>
        scenario.scenarioCode === scenarioCode
          ? { ...scenario, events: [...(scenario.events || []), event] }
          : scenario
      ),
    })),
  updateEvent: (scenarioCode, eventId, updates) =>
    set(state => ({
      scenarios: state.scenarios.map(scenario =>
        scenario.scenarioCode === scenarioCode
          ? {
              ...scenario,
              events:
                scenario.events?.map(event =>
                  event.id === parseInt(eventId)
                    ? { ...event, ...updates }
                    : event
                ) || [],
            }
          : scenario
      ),
    })),
  removeEvent: (scenarioCode, eventId) =>
    set(state => ({
      scenarios: state.scenarios.map(scenario =>
        scenario.scenarioCode === scenarioCode
          ? {
              ...scenario,
              events:
                scenario.events?.filter(
                  event => event.id !== parseInt(eventId)
                ) || [],
            }
          : scenario
      ),
    })),
  addChoice: (scenarioCode, eventId, choice) =>
    set(state => ({
      scenarios: state.scenarios.map(scenario =>
        scenario.scenarioCode === scenarioCode
          ? {
              ...scenario,
              events:
                scenario.events?.map(event =>
                  event.id === parseInt(eventId)
                    ? { ...event, choices: [...(event.choices || []), choice] }
                    : event
                ) || [],
            }
          : scenario
      ),
    })),
  updateChoice: (scenarioCode, eventId, choiceId, updates) =>
    set(state => ({
      scenarios: state.scenarios.map(scenario =>
        scenario.scenarioCode === scenarioCode
          ? {
              ...scenario,
              events:
                scenario.events?.map(event =>
                  event.id === parseInt(eventId)
                    ? {
                        ...event,
                        choices:
                          event.choices?.map(choice =>
                            choice.id === parseInt(choiceId)
                              ? { ...choice, ...updates }
                              : choice
                          ) || [],
                      }
                    : event
                ) || [],
            }
          : scenario
      ),
    })),
  removeChoice: (scenarioCode, eventId, choiceId) =>
    set(state => ({
      scenarios: state.scenarios.map(scenario =>
        scenario.scenarioCode === scenarioCode
          ? {
              ...scenario,
              events:
                scenario.events?.map(event =>
                  event.id === parseInt(eventId)
                    ? {
                        ...event,
                        choices:
                          event.choices?.filter(
                            choice => choice.id !== parseInt(choiceId)
                          ) || [],
                      }
                    : event
                ) || [],
            }
          : scenario
      ),
    })),
}));

// 앱 상태 스토어
interface AppStateStore {
  appState: AppStateType;
  openSceneForm: (sceneId?: string) => void;
  closeSceneForm: () => void;
  openScenarioForm: (scenarioId?: string) => void;
  closeScenarioForm: () => void;
}

export const useAppStateStore = create<AppStateStore>(set => ({
  appState: {
    isSceneFormOpened: false,
    modifySceneId: null,
    isScenarioFormOpened: false,
    modifyScenarioId: null,
  },
  openSceneForm: sceneId =>
    set(state => ({
      appState: {
        ...state.appState,
        isSceneFormOpened: true,
        modifySceneId: sceneId || null,
      },
    })),
  closeSceneForm: () =>
    set(state => ({
      appState: {
        ...state.appState,
        isSceneFormOpened: false,
        modifySceneId: null,
      },
    })),
  openScenarioForm: scenarioId =>
    set(state => ({
      appState: {
        ...state.appState,
        isScenarioFormOpened: true,
        modifyScenarioId: scenarioId || null,
      },
    })),
  closeScenarioForm: () =>
    set(state => ({
      appState: {
        ...state.appState,
        isScenarioFormOpened: false,
        modifyScenarioId: null,
      },
    })),
}));
