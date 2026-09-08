import type { Choice } from '../data/scenario';
import { useGameStore } from '../store/gameStore';
import styles from './ChoicesBox.module.css'; // ★追加

type Props = {
  choices: Choice[];
};

export default function ChoicesBox({ choices }: Props) {
  const jumpTo = useGameStore((state) => state.jumpTo);
  const currentIndex = useGameStore((state) => state.currentIndex);

  return (
    <div className={styles.container}>
      {choices.map((choice, index) => (
        <button
          key={index}
          className={styles.button}
          onClick={(e) => {
            e.stopPropagation();
            console.log(`選択肢クリック: 「${choice.text}」が押されました。index ${currentIndex} から ${choice.nextIndex} へジャンプします`);
            console.log(`セットするフラグ:`, choice.flagName, choice.flagValue);
            
            jumpTo(choice.nextIndex, choice.flagName, choice.flagValue);
          }}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}