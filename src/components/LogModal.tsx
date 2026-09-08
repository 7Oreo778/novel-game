import React from 'react';
import { useGameStore } from '../store/gameStore';

export const LogModal: React.FC = () => {
  // gameStoreに合わせて `history` を取得する
  const history = useGameStore((state) => state.history);
  const isLogOpen = useGameStore((state) => state.isLogOpen);
  const toggleLog = useGameStore((state) => state.toggleLog);

  if (!isLogOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>会話履歴</h3>
          {/* 引数なしで呼ぶように修正 */}
          <button onClick={() => toggleLog()} style={styles.closeButton}>×</button>
        </div>
        <div style={styles.content}>
          {history.map((item: { name: string; text: string }, index: number) => (
            <div key={index} style={styles.logItem}>
              {item.name && <span style={styles.name}>{item.name}：</span>}
              <span style={styles.text}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '80%',
    maxWidth: '600px',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    marginTop: '10px',
    paddingRight: '10px',
  },
  logItem: {
    marginBottom: '15px',
    lineHeight: '1.5',
  },
  name: {
    fontWeight: 'bold',
    color: '#333',
  },
  text: {
    color: '#555',
    whiteSpace: 'pre-wrap' as const,
  },
};