import { useEffect, useRef } from 'react';
import './App.css';

// データとコンポーネントのインポート
import { scenario, images } from './data/scenario';
import Menu from './components/Menu';
import Chara from './components/Chara';
import TextBox from './components/TextBox';
import ChoicesBox from './components/ChoicesBox'; 
import { LogModal } from './components/LogModal'; // ★追加：履歴モーダルのインポート

// Zustand と Custom Hooks のインポート
import { useGameStore } from './store/gameStore';
import { useTypewriter } from './hooks/useTypewriter';

export default function App() {
  // Zustand ストアから状態とアクションを取得
  const { currentIndex, speed, next, reset, setSpeed, isAuto } = useGameStore();

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
      gainNode.gain.value = 1.8; // 音量ブースト
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

  // ★オートモードによる自動進行処理
  useEffect(() => {
    // オートがOFFのとき、またはすでに終端のときは何もしない
    if (!isAuto || isEnd) return;

    // 選択肢が出ているときは勝手に進まないように止める
    if (current && current.choices && current.choices.length > 0) {
      return;
    }

    // タイピング中（isTyping）や、音声再生中のウェイトを考慮して
    // 「テキスト表示が完了してから一定時間（例: 2秒）」経過したら次へ進む
    if (!isTyping) {
      const timer = setTimeout(() => {
        // 次へ進む前に音声を止める処理（handleNextと同じ安全策）
        audioRefs.current.forEach((a) => {
          a.pause();
          a.currentTime = 0;
        });
        audioRefs.current = [];

        next();
      }, 2000); // 読ませたい秒数（2000ミリ秒 = 2秒）

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

  // const handleBack = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (currentIndex <= 0) return;

  //   audioRefs.current.forEach((a) => {
  //     a.pause();
  //     a.currentTime = 0;
  //   });
  //   audioRefs.current = [];

  //   back();
  // };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speed === 1.0) setSpeed(1.5);
    else if (speed === 1.5) setSpeed(2.0);
    else setSpeed(1.0);
  };

  return (
    <div id="game-container" translate="no" onClick={handleNext}>
      <Menu 
        speed={speed} 
        onReset={handleReset} 
        onToggleSpeed={toggleSpeed} 
        onReplay={handleReplay}
        // onBack={handleBack}
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

      {/* ★ここに配置（ゲーム画面の上にポップアップとして重ねて表示するため） */}
      <LogModal />
    </div>
  );
}