import { useState, useEffect, useRef } from 'react';
import './App.css';

// 外に追い出したデータと画像をインポート
import { scenario, images } from './data/scenario';

// コンポーネントのインポート
import Menu from './components/Menu';
import Chara from './components/Chara';
import TextBox from './components/TextBox';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerId = useRef<number | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  const isEnd = currentIndex >= scenario.length;
  const current = !isEnd ? scenario[currentIndex] : null;

  // VOICEVOX API呼び出し関数
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
  };

  // タイピングアニメーション処理
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

  // 音声再生処理
  useEffect(() => {
    audioRefs.current.forEach((a) => a.pause());
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

  // 速度変更処理
  useEffect(() => {
    audioRefs.current.forEach((audio) => {
      audio.playbackRate = speed;
    });
  }, [speed]);

  const handleNext = () => {
    if (isEnd) return;

    if (isTyping && current) {
      if (timerId.current) clearInterval(timerId.current);
      setDisplayText(current.text);
      setIsTyping(false);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerId.current) clearInterval(timerId.current);
    setCurrentIndex(0);
  };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeed((prevSpeed) => {
      if (prevSpeed === 1.0) return 1.5;
      if (prevSpeed === 1.5) return 2.0;
      return 1.0;
    });
  };

  return (
    <div id="game-container" translate="no" onClick={handleNext}>
      <Menu 
        speed={speed} 
        onReset={handleReset} 
        onToggleSpeed={toggleSpeed} 
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
        </>
      )}

      {isEnd && (
        <TextBox
          speaker="システム"
          displayText="【おわり】最初に戻るには「最初から」ボタンを押してください。"
        />
      )}
    </div>
  );
}