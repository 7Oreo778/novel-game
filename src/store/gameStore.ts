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
  history: HistoryItem[];
  isLogOpen: boolean;
  isAuto: boolean;        // ★オートモードの状態
  next: () => void;
  back: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setCurrentIndex: (index: number) => void;
  jumpTo: (index: number, flagName?: string, flagValue?: string | boolean) => void;
  toggleLog: () => void;
  toggleAuto: () => void; // ★オートモードの切り替え関数
  saveGame: () => void;
  loadGame: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  currentIndex: 0,
  speed: 1.0,
  flags: {},
  history: [
    { name: scenario[0].name, text: scenario[0].text }
  ],
  isLogOpen: false,
  isAuto: false, // ★初期値はOFF

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
          history: [...state.history, { name: nextItem.name, text: nextItem.text }]
        };
      }
      return state;
    }),

  back: () => set((state) => state),

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

  toggleAuto: () => set((state) => ({ isAuto: !state.isAuto })), // ★オート切り替えのアクション

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