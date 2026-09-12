import { useEffect, useRef } from 'react';
import './App.css';

// データとコンポーネントのインポート
import { scenario, images } from './data/scenario';
import Menu from './components/Menu';
import Chara from './components/Chara';
import TextBox from './components/TextBox';
import ChoicesBox from './components/ChoicesBox'; 
import { LogModal } from './components/LogModal';

// Zustand と Custom Hooks のインポート
import { useGameStore } from './store/gameStore';
import { useTypewriter } from './hooks/useTypewriter';

export default function App() {
  // Zustand ストアから状態とアクションを取得
  const { screen, setScreen, currentIndex, speed, next, reset, setSpeed, isAuto } = useGameStore();

  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const voiceCache = useRef<{ [key: string]: string }>({});

  const isEnd = currentIndex >= scenario.length;
  const current = !isEnd ? scenario[currentIndex] : null;

  // タイピングカスタムフックの呼び出し
  const { displayText, isTyping, skipTyping } = useTypewriter(current ? current.text : "");

  // 次のセリフの音声プリロード
  useEffect(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < scenario.length) {
      const nextItem = scenario[nextIndex];
      if (nextItem && nextItem.voice && typeof nextItem.voice === "object" && !Array.isArray(nextItem.voice)) {
        const { text, speakerId = 3 } = nextItem.voice;
        
        if (!voiceCache.current[text]) {
          fetch(
            `http://localhost:50021/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
            { method: "POST" }
          )
            .then((res) => res.json())
            .then((queryData) =>
              fetch(`http://localhost:50021/synthesis?speaker=${speakerId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(queryData),
              })
            )
            .then((res) => res.blob())
            .then((blob) => {
              voiceCache.current[text] = URL.createObjectURL(blob);
            })
            .catch((err) => console.log("バックグラウンドプリロード失敗:", err));
        }
      }
    }
  }, [currentIndex]);

  // VOICEVOX API呼び出し関数
  const playVoiceFromApi = async (text: string, speakerId: number = 3) => {
    try {
      let audioUrl = voiceCache.current[text];

      if (!audioUrl) {
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
        audioUrl = URL.createObjectURL(blob);
        voiceCache.current[text] = audioUrl;
      }

      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(audio);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.8;
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      audio.play();
      audioRefs.current.push(audio);
    } catch (error) {
      console.error("VOICEVOX APIとの通信に失敗しました:", error);
    }
  };

  // 音声再生処理
  useEffect(() => {
    audioRefs.current.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    audioRefs.current = [];

    const currentVoice = scenario[currentIndex]?.voice;
    if (!currentVoice) return;

    if (typeof currentVoice === "object" && !Array.isArray(currentVoice)) {
      playVoiceFromApi(currentVoice.text, currentVoice.speakerId);
      return;
    }

    const voiceList = Array.isArray(currentVoice) ? currentVoice : [currentVoice];
    voiceList.forEach((src) => {
      const audio = new Audio(src);
      audio.playbackRate = speed;
      audio.play().catch((e) => console.log("再生エラー:", e));
      audioRefs.current.push(audio);
    });
  }, [currentIndex]);

  // 速度変更時の反映
  useEffect(() => {
    audioRefs.current.forEach((audio) => {
      audio.playbackRate = speed;
    });
  }, [speed]);

  // オートモードによる自動進行処理
  useEffect(() => {
    if (!isAuto || isEnd) return;

    if (current && current.choices && current.choices.length > 0) {
      return;
    }

    if (!isTyping) {
      const timer = setTimeout(() => {
        audioRefs.current.forEach((a) => {
          a.pause();
          a.currentTime = 0;
        });
        audioRefs.current = [];

        next();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuto, isTyping, currentIndex, isEnd, current, next]);

  // 画面クリック時のハンドラー
  const handleNext = () => {
    if (isEnd) return;

    if (current && current.choices && current.choices.length > 0) {
      return;
    }

    if (isTyping) {
      skipTyping();
      return;
    }

    audioRefs.current.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    audioRefs.current = [];

    next();
  };

  // メニュー用ハンドラー群
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioRefs.current.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    audioRefs.current = [];
    reset();
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!current) return;

    audioRefs.current.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    audioRefs.current = [];

    const currentVoice = current.voice;
    if (!currentVoice) return;

    if (typeof currentVoice === "object" && !Array.isArray(currentVoice)) {
      playVoiceFromApi(currentVoice.text, currentVoice.speakerId);
      return;
    }

    const voiceList = Array.isArray(currentVoice) ? currentVoice : [currentVoice];
    voiceList.forEach((src) => {
      const audio = new Audio(src);
      audio.playbackRate = speed;
      audio.play().catch((e) => console.log("再生エラー:", e));
      audioRefs.current.push(audio);
    });
  };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speed === 1.0) setSpeed(1.5);
    else if (speed === 1.5) setSpeed(2.0);
    else setSpeed(1.0);
  };

  // --- ① タイトル画面 ---
  if (screen === 'title') {
    return (
      <div className="screen-container">
        <h1>ノベルゲームタイトル</h1>
        <div className="button-group">
          <button className="screen-btn" onClick={() => setScreen('storySelect')}>ストーリー</button>
          <button className="screen-btn" onClick={() => setScreen('gacha')}>ガチャ</button>
        </div>
      </div>
    );
  }

  // --- ② ストーリー選択画面 ---
  if (screen === 'storySelect') {
    return (
      <div className="screen-container">
        <h2>ストーリー選択</h2>
        <div className="button-group">
          <button className="screen-btn" onClick={() => { reset(); setScreen('game'); }}>第1章</button>
        </div>
        <button className="screen-btn back-btn" onClick={() => setScreen('title')}>タイトルに戻る</button>
      </div>
    );
  }

  // --- ③ ガチャ画面 ---
  if (screen === 'gacha') {
    return (
      <div className="screen-container gacha-bg">
        <h2>ガチャ画面</h2>
        <p>クリックしてガチャを引こう！</p>
        <button className="screen-btn gacha-pull-btn" onClick={() => alert('SSRが出た！（仮演出）')}>
          引く！
        </button>
        <button className="screen-btn back-btn" onClick={() => setScreen('title')}>タイトルに戻る</button>
      </div>
    );
  }

  // --- ④ ゲーム本編画面 ---
  return (
    <div id="game-container" translate="no" onClick={handleNext}>
      <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 100 }}>
        <button 
          className="screen-btn" 
          style={{ padding: '6px 12px', fontSize: '14px' }} 
          onClick={(e) => { e.stopPropagation(); setScreen('title'); }}
        >
          タイトルへ
        </button>
      </div>

      <Menu 
        speed={speed} 
        onReset={handleReset} 
        onToggleSpeed={toggleSpeed} 
        onReplay={handleReplay}
      />

      {current && (
        <>
          <Chara
            mode={current.mode}
            active={current.active}
            fullImg={images.fullImg}
            doraImg={images.doraImg}
            kiroImg={images.kiroImg}
          />
          <TextBox
            speaker={current.name}
            displayText={displayText}
          />
          {current.choices && current.choices.length > 0 && (
            <ChoicesBox choices={current.choices} />
          )}
        </>
      )}

      {isEnd && (
        <TextBox
          speaker="システム"
          displayText="【おわり】最初に戻るには「最初から」ボタンを押してください。"
        />
      )}

      <LogModal />
    </div>
  );
}