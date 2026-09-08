import React from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './Menu.module.css'; // ★追加

type Props = {
  speed: number;
  onReset: (e: React.MouseEvent) => void;
  onToggleSpeed: (e: React.MouseEvent) => void;
  onReplay: (e: React.MouseEvent) => void;
  onBack?: (e: React.MouseEvent) => void;
};

export default function Menu({ speed, onReset, onToggleSpeed, onReplay }: Props) {
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const toggleLog = useGameStore((state) => state.toggleLog);

  return (
    <div className={styles.menu}>
      <button className={styles.button} onClick={toggleLog}>履歴</button>
      <button className={styles.button} onClick={onReplay}>もう一度</button>
      <button className={styles.button} onClick={onToggleSpeed}>
        {speed.toFixed(1)}x
      </button>
      
      <button 
        className={styles.button} 
        onClick={(e) => { 
          e.stopPropagation(); 
          saveGame(); 
        }}
      >
        セーブ
      </button>

      <button 
        className={styles.button} 
        onClick={(e) => { 
          e.stopPropagation(); 
          loadGame(); 
        }}
      >
        ロード
      </button>

      <button className={styles.button} onClick={onReset}>最初から</button>
    </div>
  );
}