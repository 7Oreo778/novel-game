type Props = {
  speed: number;
  onReset: (e: React.MouseEvent) => void;
  onToggleSpeed: (e: React.MouseEvent) => void;
  onReplay: (e: React.MouseEvent) => void;
  onBack: (e: React.MouseEvent) => void; // ← 追加
};

export default function Menu({ speed, onReset, onToggleSpeed, onReplay, onBack }: Props) {
  return (
    <div className="control-menu">
      <button id="back-btn" onClick={onBack}>戻る</button>
      <button id="replay-btn" onClick={onReplay}>もう一度</button>
      <button className="speed-button" onClick={onToggleSpeed}>
        {speed.toFixed(1)}x
      </button>
      <button id="reset-btn" onClick={onReset}>最初から</button>
    </div>
  );
}