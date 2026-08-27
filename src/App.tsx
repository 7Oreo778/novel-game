// 1. 外部ライブラリや機能の読み込み（import）
import { useState } from 'react'; // Reactの状態管理フック（画面のデータを保持・更新する仕組み）
import './App.css'; // このコンポーネント用のスタイルシート（バニラJSのものを読み込む）
import doraImg from './assets/dora.webp'; // 左キャラ画像（TypeScriptがパスを検証してくれる）
import kiroImg from './assets/kiro.webp'; // 右キャラ画像
// import fullImg from './assets/full.webp'; // 1枚絵用の画像（使う時にコメント解除）

// 2. シナリオデータの型定義（TypeScriptの機能）
// シナリオ1行分が「どんなデータ構造を持つか」の設計図を作ります
type Scenario = {
  name: string; // キャラクター名（文字列）
  text: string; // セリフ（文字列）
  mode: 'full' | 'split' | 'none'; // 表示モード（指定した3つの文字列以外が入るとエラーになる）
  active: 'left' | 'right' | 'both'; // 誰が喋っているか（指定した3つの文字列以外はエラー）
};

// 3. シナリオデータ本体（配列）
// `: Scenario[]` と書くことで、上で作った型定義に沿った配列であることを保証します
const scenario: Scenario[] = [
  { name: "ずんだもん", text: "こんにちはなのだ！", mode: "split", active: "left" },
  { name: "あんこもん", text: "こんにちはだもん！", mode: "split", active: "right" },
];

// 4. メインのコンポーネント関数
export default function App() {
  // --- 状態管理（State） ---
  // currentIndex: 現在何行目のシナリオを表示しているか（初期値は 0）
  // setCurrentIndex: currentIndex の値を更新するための専用関数
  const [currentIndex, setCurrentIndex] = useState(0);

  // 現在の行のシナリオデータを配列から1件取得
  const current = scenario[currentIndex];

  // --- イベントハンドラー（画面操作時の処理） ---
  // 画面をクリックした時に次のセリフへ進める関数
  const handleNext = () => {
    // 最後のセリフ（配列の末尾）に到達していなければ、インデックスを +1 する
    if (currentIndex < scenario.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // --- 画面の描画（JSX構文） ---
  return (
    // ゲーム全体のコンテナ（クリックすると handleNext が実行される）
    <div id="game-container" onClick={handleNext}>
      
      {/* 1. 立ち絵の表示処理 */}
      {/* 条件付きレンダリング: current.mode が 'split' の時だけ直後の要素を描画 */}
      {current.mode === 'split' && (
        <>
          {/* 左キャラの画像 */}
          {/* className: active が 'right'（右が喋っている）なら 'inactive' クラスを追加して暗くする */}
          <img 
            className={`character chara-left ${current.active === 'right' ? 'inactive' : ''}`} 
            src={doraImg} 
            alt="左キャラ"
          />
          {/* 右キャラの画像 */}
          {/* className: active が 'left'（左が喋っている）なら 'inactive' クラスを追加して暗くする */}
          <img 
            className={`character chara-right ${current.active === 'left' ? 'inactive' : ''}`} 
            src={kiroImg} 
            alt="右キャラ"
          />
        </>
      )}

      {/* 2. メッセージボックス */}
      <div id="message-box">
        {/* 話者名を表示 */}
        <div id="speaker">{current.name}</div>
        {/* セリフ本文を表示 */}
        <div id="message">{current.text}</div>
      </div>
      
    </div>
  );
}