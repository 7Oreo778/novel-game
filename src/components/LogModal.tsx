import React from 'react';
import { useGameStore } from '../store/gameStore';
import styles from './LogModal.module.css';

export const LogModal: React.FC = () => {
  const history = useGameStore((state) => state.history) || [];
  const isLogOpen = useGameStore((state) => state.isLogOpen);
  const toggleLog = useGameStore((state) => state.toggleLog);

  if (!isLogOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => toggleLog()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>会話履歴</h3>
          <button onClick={() => toggleLog()} className={styles.closeButton}>
            ✕ 閉じる
          </button>
        </div>
        <div className={styles.content}>
          {history.length === 0 ? (
            <p className={styles.emptyText}>履歴がありません</p>
          ) : (
            history.map((item: { name: string; text: string }, index: number) => (
              <div key={index} className={styles.logItem}>
                {item.name && <span className={styles.name}>{item.name}：</span>}
                <span className={styles.text}>{item.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};