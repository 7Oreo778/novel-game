import { useState, useEffect, useRef } from 'react';
import './App.css';
import doraImg from './assets/dora.webp';
import kiroImg from './assets/kiro.webp';
import fullImg from './assets/full.webp'; // 1枚絵画像を読み込み

// シナリオデータの型定義
type Scenario = {
  name: string;
  text: string;
  mode: 'full' | 'split' | 'none';
  active: 'left' | 'right' | 'both';
};

// シナリオデータ本体
const scenario: Scenario[] = [
  { name: "ナレーション", text: "物語が始まる……", mode: "full", active: "both" },
  { name: "四国めたん", text: "あら、こんにちはずんだもん。", mode: "split", active: "left" },
  { name: "ずんだもん", text: "めたん！こんにちはなのだ！", mode: "split", active: "right" },
  { name: "全員", text: "2人同時に喋るときは両方明るくもできるのだ！", mode: "split", active: "both" }
];

export default function App() {
  // --- 状態管理（State） ---
  const [currentIndex, setCurrentIndex] = useState(0); // 現在のシナリオ番号
  const [displayText, setDisplayText] = useState("");   // 画面に出す文字
  const [isTyping, setIsTyping] = useState(false);     // タイピング中フラグ
  const timerId = useRef<number | null>(null);         // タイマー記憶用

  // シナリオの終了判定（配列の範囲を超えたか）
  const isEnd = currentIndex >= scenario.length;
  const current = !isEnd ? scenario[currentIndex] : null;

  // --- タイピングアニメーション処理（useEffect） ---
  useEffect(() => {
    if (!current) return;

    let charIndex = 0;
    setDisplayText("");
    setIsTyping(true);

    if (timerId.current) clearInterval(timerId.current);

    timerId.current = window.setInterval(() => {
      charIndex++;
      if (charIndex <= current.text.length) {
        setDisplayText(current.text.slice(0, charIndex));
      } else {
        setIsTyping(false);
        if (timerId.current) clearInterval(timerId.current);
      }
    }, 40);

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [currentIndex]);

  // --- イベントハンドラー ---
  // 画面を進める処理
  const handleNext = () => {
    // 終了時は何もしない
    if (isEnd) return;

    // タイピング中にクリックされたら一瞬で全文出す（スキップ）
    if (isTyping && current) {
      if (timerId.current) clearInterval(timerId.current);
      setDisplayText(current.text);
      setIsTyping(false);
      return;
    }

    // 次のセリフへ進む
    setCurrentIndex((prev) => prev + 1);
  };

  // 最初からやり直すリセット処理
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // ゲームコンテナ側のクリック（handleNext）を横取りさせない
    if (timerId.current) clearInterval(timerId.current);
    setCurrentIndex(0);
  };

  // --- 画面描画（JSX） ---
  return (
    <div id="game-container" translate="no" onClick={handleNext}>
      {/* 最初からボタン */}
      <button id="reset-btn" onClick={handleReset}>最初から</button>

      {/* シナリオ進行中の表示 */}
      {current && (
        <>
          {/* 1枚絵（full）モード */}
          {current.mode === 'full' && (
            <img 
              className="character chara-center" 
              src={fullImg} 
              alt="一枚絵" 
            />
          )}

          {/* 立ち絵2分割（split）モード */}
          {current.mode === 'split' && (
            <>
              <img 
                className={`character chara-left ${current.active === 'right' ? 'inactive' : ''}`} 
                src={doraImg} 
                alt="左キャラ"
              />
              <img 
                className={`character chara-right ${current.active === 'left' ? 'inactive' : ''}`} 
                src={kiroImg} 
                alt="右キャラ"
              />
            </>
          )}

          {/* メッセージ領域 */}
          <div id="message-box">
            <div id="speaker">{current.name}</div>
            <div id="message">{displayText}</div>
          </div>
        </>
      )}

      {/* 画面終了時の表示（おわり） */}
      {isEnd && (
        <div id="message-box">
          <div id="speaker">システム</div>
          <div id="message">【おわり】最初に戻るには「最初から」ボタンを押してください。</div>
        </div>
      )}
    </div>
  );
}