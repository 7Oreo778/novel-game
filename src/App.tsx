import { useState } from 'react';
import './App.css';// CSSはバニラJSのものをそのまま読み込む！
import doraImg from './assets/dora.webp';
import kiroImg from './assets/kiro.webp';
import fullImg from './assets/full.webp';

// シナリオデータ（型定義をつけて安全に！）
type Scenario = {
  name: string;
  text: string;
  mode: 'full' | 'split' | 'none';
  active: 'left' | 'right' | 'both';
};

const scenario: Scenario[] = [
  { name: "ずんだもん", text: "こんにちはなのだ！", mode: "split", active: "left" },
  { name: "四国めたん", text: "あら、こんにちはずんだもん。", mode: "split", active: "right" },
];

export default function App() {
  // ゲームの状態（何行目か）を管理
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = scenario[currentIndex];

  // クリックした時の進行処理
  const handleNext = () => {
    if (currentIndex < scenario.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div id="game-container" onClick={handleNext}>
      {/* 1. 立ち絵（状態に合わせて表示・非表示・明暗が自動で変わる） */}
      {current.mode === 'split' && (
        <>
          {/* 左キャラ */}
          <img 
            className={`character chara-left ${current.active === 'right' ? 'inactive' : ''}`} 
            src={doraImg} 
            alt="左キャラ"
          />
          {/* 右キャラ */}
          <img 
            className={`character chara-right ${current.active === 'left' ? 'inactive' : ''}`} 
            src={kiroImg} 
            alt="右キャラ"
          />
        </>
      )}

      {/* 2. メッセージボックス */}
      <div id="message-box">
        <div id="speaker">{current.name}</div>
        <div id="message">{current.text}</div>
      </div>
    </div>
  );
}