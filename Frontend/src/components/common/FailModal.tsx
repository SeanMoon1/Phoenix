type Props = {
  message: string;
  onClose: () => void;
  onRetry: () => void;
};

export default function FailModal({ message, onClose, onRetry }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white text-black rounded-2xl p-8 shadow-2xl w-[90%] max-w-[520px] text-center">
        <h2 className="text-3xl font-bold mb-3 text-red-700">실패</h2>
        <p className="text-lg mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-5 py-3 rounded-lg bg-neutral-700 text-white hover:bg-neutral-800"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            className="px-5 py-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={onRetry}
          >
            다시 도전
          </button>
        </div>
      </div>
    </div>
  );
}
