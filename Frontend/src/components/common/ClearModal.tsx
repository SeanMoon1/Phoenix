import phoenixImg from '@/assets/images/phoenix.png';

type Props = {
  message: string;
  onClose: () => void;
};

export default function ClearModal({ message, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
      aria-live="assertive"
    >
      <div className="relative flex flex-col items-center">
        <div className="relative flex flex-col items-center">
          <img
            src={phoenixImg}
            alt="Phoenix Mascot"
            className="h-56 w-auto animate-bounce"
          />
          {/* 말풍선 */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 bg-white text-black rounded-2xl p-4 shadow-lg w-72 text-center">
            <p className="text-base font-semibold leading-relaxed">{message}</p>
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0
                 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"
            />
          </div>
        </div>

        {/* 확인 버튼 */}
        <button
          className="-mt-5 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
