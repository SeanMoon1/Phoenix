export const scenarioIdMap: Record<string, number> = {
  fire: 1,
  earthquake: 2,
  'first-aid': 3,
  'traffic-accident': 4,
  flood: 5,
};

export const getScenarioTypeForApi = (scenarioType: string): string => {
  const map: Record<string, string> = {
    fire: 'FIRE',
    earthquake: 'EARTHQUAKE',
    'first-aid': 'EMERGENCY',
    'traffic-accident': 'TRAFFIC',
    flood: 'FLOOD',
  };
  const key = (scenarioType || '').toString().toLowerCase();
  return map[key] || 'FIRE';
};

export const getScenarioSetName = (type: string): string => {
  switch ((type || '').toString().toLowerCase()) {
    case 'fire':
      return '화재 대응';
    case 'first-aid':
      return '응급처치';
    case 'traffic-accident':
      return '교통사고 대응';
    case 'earthquake':
      return '지진 대응';
    case 'flood':
      return '홍수 대응';
    default:
      return '재난 대응';
  }
};
