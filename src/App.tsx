// 1. 外部ライブラリや機能の読み込み（import）
// useState: 画面のデータ（状態）を保持・更新するフック
// useEffect: セリフが変わった時など「特定のタイミング」で自動処理を走らせるフック
// useRef: タイマーのIDなど、画面を再描画させずに値を保持し続ける箱を作るフック
import { useState, useEffect, useRef } from 'react'; 
import './App.css'; 
import doraImg from './assets/dora.webp'; 
import kiroImg from './assets/kiro.webp'; 
// import fullImg from './assets/full.webp'; 

// 2. シナリオデータの型定義（TypeScript）
type Scenario = {
  name: string; 
  text: string; 
  mode: 'full' | 'split' | 'none'; 
  active: 'left' | 'right' | 'both'; 
};

// 3. シナリオデータ本体
const scenario: Scenario[] = [
  { name: "四国めたん", text: "あら。こんにちは、ずんだもん。", mode: "split", active: "left" },
  { name: "ずんだもん", text: "めたん！こんにちはなのだ！", mode: "split", active: "right" },
];

// 4. メインのコンポーネント関数
export default function App() {
  // --- 状態管理（State） ---
  // 現在表示中のシナリオのインデックス番号（初期値 0）
  const [currentIndex, setCurrentIndex] = useState(0);

  // 画面上に実際に1文字ずつ表示していく文字列データ（初期値は空文字）
  const [displayText, setDisplayText] = useState("");

  // 現在タイピングアニメーション中かどうかを判定するフラグ（初期値 false）
  const [isTyping, setIsTyping] = useState(false);

  // setInterval のタイマーIDを保存する参照オブジェクト（画面再描画の影響を受けない記憶領域）
  const timerId = useRef<number | null>(null);
  // const timerId = useRef<NodeJS.Timeout | null>(null);　Node.js 環境専用の型

  // 現在のインデックス番号に対応するシナリオオブジェクトを1件取得
  const current = scenario[currentIndex];

  // --- タイピングアニメーション処理（副作用フック） ---
  // 第二引数の [currentIndex] が変化した時（＝次のセリフに進んだ時）に自動実行される
// --- タイピングアニメーション処理（最適化版） ---
  useEffect(() => {
    if (!current) return;

    let charIndex = 0;
    setDisplayText("");
    setIsTyping(true);

    if (timerId.current) clearInterval(timerId.current);

    // 50ms → 40ms 程度に調整し、画面描画の周期と馴染ませる
    timerId.current = window.setInterval(() => {
      charIndex++;
      
      // 文字列の切り出し処理を軽量化
      setDisplayText(current.text.slice(0, charIndex));

      if (charIndex >= current.text.length) {
        setIsTyping(false);
        if (timerId.current) clearInterval(timerId.current);
      }
    }, 40); 

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [currentIndex]);

  // --- イベントハンドラー（画面クリック時の進行制御） ---
  const handleNext = () => {
    // 【割り込み処理】タイピング途中にクリックされた場合
    if (isTyping) {
      if (timerId.current) clearInterval(timerId.current); // タイマーを即座に停止
      setDisplayText(current.text); // 一瞬でセリフの全文を表示
      setIsTyping(false);            // タイピング完了状態にする
      return;                        // ここで処理を終了（次のセリフには進まない）
    }

    // 【通常の進行】全文表示されている時にクリックされた場合
    // 最後のセリフ（配列の末尾）に到達していなければ、インデックスを +1 して次のセリフへ
    if (currentIndex < scenario.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // --- 画面の描画（JSX） ---
  return (
    // translate="no" を追加！　翻訳しないように！
    <div id="game-container" translate="no" onClick={handleNext}>
      
      {/* 1. 立ち絵の表示処理 */}
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

      {/* 2. メッセージボックス */}
      <div id="message-box">
        <div id="speaker">{current.name}</div>
        {/* current.text（全文）ではなく、タイピング制御で更新される displayText を出力 */}
        <div id="message">{displayText}</div>
      </div>
      
    </div>
  );
}