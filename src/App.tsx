import { useState, useEffect, useRef } from 'react';
import './App.css';

// コンポーネントの読み込み
import { MessageWindow } from './components/TextBox';
import { CharacterArea } from './components/Chara';
import { ControlMenu } from './components/Menu';

// 画像の読み込み
import doraImg from './assets/images/characters/dora.webp';
import kiroImg from './assets/images/characters/kiro.webp';
import fullImg from './assets/images/characters/full.webp';

// ボイスの読み込み
import voice00 from './assets/audio/voices/000_narr_intro.mp3';
import voice01 from './assets/audio/voices/001_metan_greet.mp3';
import voice02 from './assets/audio/voices/002_zunda_greet.mp3';
import voice03m from './assets/audio/voices/003_metan_both.mp3';
import voice03z from './assets/audio/voices/004_zunda_both.mp3';

// 型定義とシナリオデータは変更なし...
type VoiceConfig = {
  text: string;
  speakerId: number;
};

type Scenario = {
  name: string;
  text: string;
  mode?: 'full' | 'split' | 'none';
  active?: 'left' | 'right' | 'both' | 'none';
  voice?: string | string[] | VoiceConfig;
};

const scenario: Scenario[] = [
  { name: "", text: "画面をクリックしてスタート" },
  { name: "", text: "物語が始まる……", mode: "full", voice: voice00 },
  { name: "四国めたん", text: "あら、こんにちはずんだもん。", mode: "split", active: "left", voice: voice01 },
  { name: "ずんだもん", text: "めたん！こんにちはなのだ！速度確認のために長文を喋るのだ！吾輩は豆である。名前はもう有る。どこで生れたかとんと見当がつかぬ。おそらく東北地方であろう。", mode: "split", active: "right", voice: voice02 },
  { name: "二人", text: "2人同時に喋るときは両方明るくできる！", mode: "split", active: "both", voice: [voice03m, voice03z] },
  { name: "ずんだもん", text: "ここからはAPIでの音声入力なのだ！", voice: { text: "ここからはエーピーアイでの音声入力なのだ！", speakerId: 3 } },
  { name: "四国めたん", text: "あら、voicesフォルダにmp3を入れないと自分以外は聞けないから忘れないようにね", voice: { text: "あら、ボイシーズフォルダにエムピースリーを入れないと自分以外は聞けないから忘れないようにね", speakerId: 2 } },
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerId = useRef<number | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  const isEnd = currentIndex >= scenario.length;
  const current = !isEnd ? scenario[currentIndex] : null;

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
      {/* 1. 操作系ボタンメニュー */}
      <ControlMenu 
        speed={speed} 
        onReset={handleReset} 
        onToggleSpeed={toggleSpeed} 
      />

      {/* 2. 進行中の画面表示 */}
      {current && (
        <>
          <CharacterArea
            mode={current.mode}
            active={current.active}
            fullImg={fullImg}
            doraImg={doraImg}
            kiroImg={kiroImg}
          />

          <MessageWindow
            speaker={current.name}
            displayText={displayText}
          />
        </>
      )}

      {/* 3. 画面終了時 */}
      {isEnd && (
        <MessageWindow
          speaker="システム"
          displayText="【おわり】最初に戻るには「最初から」ボタンを押してください。"
        />
      )}
    </div>
  );
}