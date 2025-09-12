import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrafficAccidentScenarioPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // traffic 타입으로 ScenarioPage로 리다이렉트
    navigate('/training/scenario/traffic', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>교통사고 대응 훈련으로 이동 중...</p>
    </div>
  );
}
