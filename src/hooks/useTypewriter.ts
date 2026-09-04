import { useState, useEffect, useRef } from 'react';

export function useTypewriter(fullText: string, speedMs: number = 40) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerId = useRef<number | null>(null);

  useEffect(() => {
    let charIndex = 0;
    setDisplayText("");
    setIsTyping(true);

    if (timerId.current) clearInterval(timerId.current);

    timerId.current = window.setInterval(() => {
      charIndex++;
      if (charIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, charIndex));
      } else {
        setIsTyping(false);
        if (timerId.current) clearInterval(timerId.current);
      }
    }, speedMs);

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [fullText, speedMs]);

  // タイピングを強制終了して全文を表示する関数
  const skipTyping = () => {
    if (timerId.current) clearInterval(timerId.current);
    setDisplayText(fullText);
    setIsTyping(false);
  };

  return { displayText, isTyping, skipTyping };
}