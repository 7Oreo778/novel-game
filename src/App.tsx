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

  // 鳴っている音声を管理するRef
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  // ★追加：APIで生成した音声を一時保存しておくキャッシュ（辞書）
  const voiceCache = useRef<{ [key: string]: string }>({});

  const isEnd = currentIndex >= scenario.length;
  const current = !isEnd ? scenario[currentIndex] : null;

  // ★追加：次のセリフにAPI音声があれば、裏でこっそり先読み（プリロード）する
  useEffect(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < scenario.length) {
      const nextItem = scenario[nextIndex];
      if (nextItem && nextItem.voice && typeof nextItem.voice === "object" && !Array.isArray(nextItem.voice)) {
        const { text, speakerId = 3 } = nextItem.voice;
        
        // まだキャッシュにない場合だけ裏でフェッチする
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

  // VOICEVOX API呼び出し関数（キャッシュ対応＆音量ブースト版）
  const playVoiceFromApi = async (text: string, speakerId: number = 3) => {
    try {
      let audioUrl = voiceCache.current[text];

      // キャッシュにない場合は通常通りAPIを叩いてキャッシュに保存する
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

      // Web Audio APIを使って音量を強制的に増幅
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

  // 音声をもう一度再生する処理（既存の音声を止めてから再生）
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
    audioRefs.current.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    audioRefs.current = [];
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

  // 1つ前のセリフに戻る処理
  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex <= 0) return;

    audioRefs.current.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
    audioRefs.current = [];

    setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div id="game-container" translate="no" onClick={handleNext}>
      <Menu 
        speed={speed} 
        onReset={handleReset} 
        onToggleSpeed={toggleSpeed} 
        onReplay={handleReplay}
        onBack={handleBack}
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