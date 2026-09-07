import React from 'react';
import { useGameStore } from '../store/gameStore'; // Zustandストアをインポート

type Props = {
  speed: number;
  onReset: (e: React.MouseEvent) => void;
  onToggleSpeed: (e: React.MouseEvent) => void;
  onReplay: (e: React.MouseEvent) => void;
  onBack: (e: React.MouseEvent) => void;
};

export default function Menu({ speed, onReset, onToggleSpeed, onReplay, onBack }: Props) {
  // Zustandストアからセーブ・ロードの関数を取得
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);

  return (
    <div className="control-menu">
      <button id="back-btn" onClick={onBack}>戻る</button>
      <button id="replay-btn" onClick={onReplay}>もう一度</button>
      <button className="speed-button" onClick={onToggleSpeed}>
        {speed.toFixed(1)}x
      </button>
      
      {/* ★追加：セーブボタン（クリック時のイベントバブリングを防ぐ） */}
      <button 
        id="save-btn" 
        onClick={(e) => { 
          e.stopPropagation(); 
          saveGame(); 
        }}
      >
        セーブ
      </button>

      {/* ★追加：ロードボタン */}
      <button 
        id="load-btn" 
        onClick={(e) => { 
          e.stopPropagation(); 
          loadGame(); 
        }}
      >
        ロード
      </button>

      <button id="reset-btn" onClick={onReset}>最初から</button>
    </div>
  );
}