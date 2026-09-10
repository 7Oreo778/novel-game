import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './Menu.module.css';

type Props = {
  speed: number;
  onReset: (e: React.MouseEvent) => void;
  onToggleSpeed: (e: React.MouseEvent) => void;
  onReplay: (e: React.MouseEvent) => void;
  onBack?: (e: React.MouseEvent) => void;
};

export default function Menu({ speed, onReset, onToggleSpeed, onReplay }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const toggleLog = useGameStore((state) => state.toggleLog);
  const isAuto = useGameStore((state) => state.isAuto);
  const toggleAuto = useGameStore((state) => state.toggleAuto);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.menuContainer}>
      {/* ハンバーガーボタン（常時右上・クリックで開閉） */}
      <button className={styles.hamburgerButton} onClick={toggleMenu}>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      {/* メニューが開いているときだけ展開表示 */}
      {isOpen && (
        <div className={styles.menuList} onClick={(e) => e.stopPropagation()}>
          {/* 各ボタンを押しても閉じないように setIsOn(false) を削除 */}
          <button className={styles.button} onClick={toggleLog}>履歴</button>
          <button className={styles.button} onClick={onReplay}>もう一度</button>
          <button className={styles.button} onClick={onToggleSpeed}>
            {speed.toFixed(1)}x
          </button>
          <button 
            className={`${styles.button} ${isAuto ? styles.activeAuto : ''}`} 
            onClick={toggleAuto}
          >
            {isAuto ? 'オート中' : 'オート'}
          </button>
          <button className={styles.button} onClick={saveGame}>セーブ</button>
          <button className={styles.button} onClick={loadGame}>ロード</button>
          <button className={styles.button} onClick={onReset}>最初から</button>
        </div>
      )}
    </div>
  );
}