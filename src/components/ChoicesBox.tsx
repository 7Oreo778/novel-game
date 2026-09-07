import type { Choice } from '../data/scenario';
import { useGameStore } from '../store/gameStore';

type Props = {
  choices: Choice[];
};

export default function ChoicesBox({ choices }: Props) {
  const jumpTo = useGameStore((state) => state.jumpTo);
  const currentIndex = useGameStore((state) => state.currentIndex); // 現在のインデックスも確認用に追加

  return (
    <div className="choices-container">
      {choices.map((choice, index) => (
        <button
          key={index}
          className="choice-button"
          onClick={(e) => {
            e.stopPropagation();
            console.log(`選択肢クリック: 「${choice.text}」が押されました。index ${currentIndex} から ${choice.nextIndex} へジャンプします`);
            console.log(`セットするフラグ:`, choice.flagName, choice.flagValue);
            
            // 実際にジャンプを実行
            jumpTo(choice.nextIndex, choice.flagName, choice.flagValue);
          }}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}