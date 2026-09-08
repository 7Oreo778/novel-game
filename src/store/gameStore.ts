// src/store/gameStore.ts
import { create } from 'zustand';
import { scenario } from '../data/scenario';

type HistoryItem = {
  name: string;
  text: string;
};

type GameState = {
  currentIndex: number;
  speed: number;
  flags: { [key: string]: string | boolean };
  history: HistoryItem[]; // ★履歴用配列
  isLogOpen: boolean;     // ★ログ画面の開閉状態
  next: () => void;
  back: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setCurrentIndex: (index: number) => void;
  jumpTo: (index: number, flagName?: string, flagValue?: string | boolean) => void;
  toggleLog: () => void;  // ★ログ画面の切り替え
  saveGame: () => void;
  loadGame: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  currentIndex: 0,
  speed: 1.0,
  flags: {},
  history: [
    { name: scenario[0].name, text: scenario[0].text } // 初期テキストを登録
  ],
  isLogOpen: false,

  next: () =>
    set((state) => {
      const currentItem = scenario[state.currentIndex];
      if (currentItem && currentItem.choices && currentItem.choices.length > 0) {
        return state; 
      }

      if (state.currentIndex < scenario.length - 1) {
        const nextIndex = state.currentIndex + 1;
        const nextItem = scenario[nextIndex];
        return {
          currentIndex: nextIndex,
          // 履歴に追加（名前とテキスト）
          history: [...state.history, { name: nextItem.name, text: nextItem.text }]
        };
      }
      return state;
    }),

  back: () => set((state) => state), // 複雑になるため巻き戻しは無効化、または削除してOKです

  reset: () => set({ 
    currentIndex: 0, 
    flags: {}, 
    history: [{ name: scenario[0].name, text: scenario[0].text }] 
  }),

  setSpeed: (speed) => set({ speed }),

  setCurrentIndex: (index) => 
    set((state) => {
      const targetItem = scenario[index];
      return {
        currentIndex: index,
        history: targetItem ? [...state.history, { name: targetItem.name, text: targetItem.text }] : state.history
      };
    }),

  jumpTo: (index, flagName, flagValue) =>
    set((state) => {
      const newFlags = { ...state.flags };
      if (flagName) {
        newFlags[flagName] = flagValue ?? true;
      }
      const targetItem = scenario[index];
      return {
        currentIndex: index,
        flags: newFlags,
        history: targetItem ? [...state.history, { name: targetItem.name, text: targetItem.text }] : state.history
      };
    }),

  toggleLog: () => set((state) => ({ isLogOpen: !state.isLogOpen })),

  saveGame: () => {
    const { currentIndex, flags, history } = get();
    localStorage.setItem('novel_game_save', JSON.stringify({ currentIndex, flags, history }));
    alert('セーブしました！');
  },

  loadGame: () => {
    const savedData = localStorage.getItem('novel_game_save');
    if (!savedData) {
      alert('セーブデータが見つかりません');
      return;
    }
    try {
      const { currentIndex, flags, history } = JSON.parse(savedData);
      set({ currentIndex, flags, history: history || [] });
      alert('ロードしました！');
    } catch (e) {
      console.error('読み込み失敗', e);
    }
  },
}));