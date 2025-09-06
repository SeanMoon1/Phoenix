import { Link } from 'react-router-dom';

type Props = {
  to?: string; // 이동 경로 (기본: /training).
  label?: string; // 버튼 라벨 (기본: "다른 훈련하기")
  className?: string; // 외부 여백/정렬 커스터마이즈용
  // prop 생략 가능
};

export default function PlayMoreButton({
  to = '/training',
  label = '다른 훈련하기',
  className = '',
}: Props) {
  return (
    <div className={`mt-8 mb-4 flex justify-center ${className}`}>
      <Link
        to={to}
        className="px-6 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-md
                   focus:outline-none focus:ring-2 focus:ring-orange-400"
        aria-label={label}
      >
        {label}
      </Link>
    </div>
  );
}
