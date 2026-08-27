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
  useEffect(() => {
    // 安全装置: データが存在しなければ何もしない
    if (!current) return;

    let charIndex = 0; // 現在何文字目まで出力したかをカウントする変数
    setDisplayText(""); // 表示用テキストを一旦空リセット
    setIsTyping(true);   // タイピング中フラグを ON にする

    // もし過去のタイマーが動いていたら念のため停止（連打時の重複防止）
    if (timerId.current) clearInterval(timerId.current);

    // 50ミリ秒ごとに1文字ずつ文字を増やすタイマーを開始
    timerId.current = setInterval(() => {
      charIndex++;
      
      // セリフの文字数以下の場合は文字を切り出して画面用Stateを更新
      if (charIndex <= current.text.length) {
        setDisplayText(current.text.slice(0, charIndex));
      } else {
        // 全文字の出力が終わったらタイピング完了処理
        setIsTyping(false); // タイピング中フラグを OFF
        if (timerId.current) clearInterval(timerId.current); // タイマー停止
      }
    }, 50);

    // クリーンアップ関数: コンポーネントが破棄されたり、次のセリフに移る際にタイマーを自動破棄
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [currentIndex]); // currentIndex（セリフ番号）が書き換わるたびにこの全処理が再実行される

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
    <div id="game-container" onClick={handleNext}>
      
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