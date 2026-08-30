import { useState, useEffect, useRef } from 'react';
import './App.css';
// 画像の読み込み
import doraImg from './assets/images/characters/dora.webp';
import kiroImg from './assets/images/characters/kiro.webp';
import fullImg from './assets/images/characters/full.webp';

// ボイスの読み込み（今回追加！）
import voice00 from './assets/audio/voices/000_narr_intro.mp3';
import voice01 from './assets/audio/voices/001_metan_greet.mp3';
import voice02 from './assets/audio/voices/002_zunda_greet.mp3';
import voice03m from './assets/audio/voices/003_metan_both.mp3';
import voice03z from './assets/audio/voices/004_zunda_both.mp3';

// シナリオデータの型定義
type VoiceConfig = { //API
  text: string;      // 喋らせたいテキスト
  speakerId: number; // VOICEVOXのキャラID（ずんだもん=3, めたん=2 など）
};

type Scenario = {
  name: string;
  text: string;
  mode?: 'full' | 'split' | 'none';             // ? をつければ書かなくてもOKになる
  active?: 'left' | 'right' | 'both' | 'none';  // ? をつければ書かなくてもOKになる
  // voice に mp3パス（単体/配列）または API用設定 を指定できるようにする
  voice?: string | string[] | VoiceConfig;
};

// シナリオデータ本体
const scenario: Scenario[] = [
  // 画面をクリックさせるための開始ページ（voice は指定しない）
  { name: "", text: "画面をクリックしてスタート" },
  { name: "", text: "物語が始まる……", voice: voice00 },
  { name: "四国めたん", text: "あら、こんにちはずんだもん。", mode: "split", active: "left", voice: voice01 },
  { name: "ずんだもん", text: "めたん！こんにちはなのだ！速度確認のために長文を喋るのだ！吾輩は豆である。名前はもう有る。どこで生れたかとんと見当がつかぬ。おそらく東北地方であろう。", mode: "split", active: "right", voice: voice02 },
  { name: "二人", text: "2人同時に喋るときは両方明るくできる！", mode: "split", active: "both", voice: [voice03m, voice03z] },
  // ★ ここからAPIでのリアルタイム音声生成！
  { name: "ずんだもん", text: "ここからはAPIでの音声入力なのだ！", voice: { text: "ここからはエーピーアイでの音声入力なのだ！", speakerId: 3 } },
  { name: "四国めたん", text: "あら、voicesフォルダにmp3を入れないと自分以外は聞けないから忘れないようにね", voice: { text: "あら、ボイシーズフォルダにエムピースリーを入れないと自分以外は聞けないから忘れないようにね", speakerId: 2 } },
];

export default function App() {
  // --- 状態管理（State） ---
  const [currentIndex, setCurrentIndex] = useState(0); // 現在のシナリオ番号
  const [displayText, setDisplayText] = useState("");   // 画面に出す文字
  const [isTyping, setIsTyping] = useState(false);     // タイピング中フラグ
  const timerId = useRef<number | null>(null);         // タイマー記憶用
  // 再生速度の状態（初期値は 1.0）
  const [speed, setSpeed] = useState<number>(1.0);
  // 複数の Audio インスタンスを配列で保持する
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  // シナリオの終了判定（配列の範囲を超えたか）
  const isEnd = currentIndex >= scenario.length;
  const current = !isEnd ? scenario[currentIndex] : null;

  // ★ ここに playVoiceFromApi を配置！
  const playVoiceFromApi = async (text: string, speakerId: number = 3) => {
    try {
      const queryRes = await fetch(
        `http://localhost:50021/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
        { method: "POST" }
      );
      const queryData = await queryRes.json();

      const synthRes = await fetch(
        `http://localhost:50021/synthesis?speaker=${speakerId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queryData),
        }
      );

      const blob = await synthRes.blob();
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;
      audio.play();

      audioRefs.current.push(audio);
    } catch (error) {
      console.error("VOICEVOX APIとの通信に失敗しました:", error);
    }
  }

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

// --- 1. ボイス再生処理（currentIndex 変更時） ---
  useEffect(() => {
    // 再生中の全音声を停止＆破棄
    audioRefs.current.forEach((a) => a.pause());
    audioRefs.current = [];

    const currentVoice = scenario[currentIndex]?.voice;
    if (!currentVoice) return;

    // --- パターンA: APIを使う設定の場合 ---
    if (typeof currentVoice === "object" && !Array.isArray(currentVoice)) {
      playVoiceFromApi(currentVoice.text, currentVoice.speakerId);
      return;
    }

    // --- パターンB: MP3ファイル（単体または配列）の場合 ---
    const voiceList = Array.isArray(currentVoice) ? currentVoice : [currentVoice];

    voiceList.forEach((src) => {
      const audio = new Audio(src);
      audio.playbackRate = speed;
      audio.play().catch((e) => console.log("再生エラー:", e));
      audioRefs.current.push(audio);
    });
  }, [currentIndex]);

  // --- 2. リアルタイム速度変更処理（speed 変更時） ---
  useEffect(() => {
    // 再生中のすべての音声の速度を一括変更
    audioRefs.current.forEach((audio) => {
      audio.playbackRate = speed;
    });
  }, [speed]);

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

  // 速度を切り替える関数
  const toggleSpeed = (e: React.MouseEvent) => {
    // 画面全体のクリックイベント（セリフ送りの処理）に波及しないように止める
    e.stopPropagation();

    setSpeed((prevSpeed) => {
      if (prevSpeed === 1.0) return 1.5;
      if (prevSpeed === 1.5) return 2.0;
      return 1.0;
    });
  };

  // --- 画面描画（JSX） ---
  return (
    <div id="game-container" translate="no" onClick={handleNext}>
      {/* 最初からボタン */}
      <button id="reset-btn" onClick={handleReset}>最初から</button>
      <button className="speed-button" onClick={toggleSpeed}>
          {speed.toFixed(1)}x
        </button>

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