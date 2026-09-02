type Props = {
  speed: number;
  onReset: (e: React.MouseEvent) => void;
  onToggleSpeed: (e: React.MouseEvent) => void;
  onReplay: (e: React.MouseEvent) => void; // ← 追加
};

export default function Menu({ speed, onReset, onToggleSpeed, onReplay }: Props) {
  return (
    <div className="control-menu">
      <button id="reset-btn" onClick={onReset}>最初から</button>
      <button className="speed-button" onClick={onToggleSpeed}>
        {speed.toFixed(1)}x
      </button>
      <button id="replay-btn" onClick={onReplay}>もう一度</button> {/* ← 追加 */}
    </div>
  );
}