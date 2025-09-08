import Confetti from 'react-confetti';

type Props = {
  show: boolean;
  vw: number;
  vh: number;
};

export default function ConfettiOverlay({ show, vw, vh }: Props) {
  if (!show) return null;
  return (
    <Confetti
      width={Math.max(0, vw - 1)}
      height={vh}
      recycle={false}
      numberOfPieces={320}
      gravity={0.25}
      wind={0}
      tweenDuration={4800}
      confettiSource={{ x: vw / 2 - 10, y: vh / 2 - 10, w: 20, h: 20 }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
    />
  );
}
