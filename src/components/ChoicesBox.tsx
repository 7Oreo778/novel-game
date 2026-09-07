import type { Choice } from '../data/scenario'; // 型のみをインポートする場合は `import type` を使うルールへの対応
import { useGameStore } from '../store/gameStore';

// コンポーネントが受け取るプロパティの型定義
type Props = {
  choices: Choice[]; // シナリオデータから渡される選択肢の配列
};

/**
 * 選択肢を表示・選択するためのコンポーネント
 */
export default function ChoicesBox({ choices }: Props) {
  // Zustandストアから、指定インデックスへのジャンプとフラグを更新する関数を取得
  const jumpTo = useGameStore((state) => state.jumpTo);

  return (
    <div className="choices-container">
      {choices.map((choice, index) => (
        <button
          key={index}
          className="choice-button"
          onClick={(e) => {
            e.stopPropagation(); // 画面全体のクリックイベント（背景クリックでの次へ進む等）が暴発するのを防ぐ
            // 選択肢に設定されたジャンプ先インデックスと、フラグ名・値をストアに渡す
            jumpTo(choice.nextIndex, choice.flagName, choice.flagValue);
          }}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}