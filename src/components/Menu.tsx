type Props = {
  speed: number;
  onReset: (e: React.MouseEvent) => void;
  onToggleSpeed: (e: React.MouseEvent) => void;
};

// 先頭に default をつける！
export default function Menu({ speed, onReset, onToggleSpeed }: Props) {
  return (
    <div className="control-menu">
      <button id="reset-btn" onClick={onReset}>最初から</button>
      <button className="speed-button" onClick={onToggleSpeed}>
        {speed.toFixed(1)}x
      </button>
    </div>
  );
}