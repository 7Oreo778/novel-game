import { create } from 'zustand';
import { scenario } from '../data/scenario';

type GameState = {
  currentIndex: number;
  speed: number;
  flags: { [key: string]: string | boolean }; // ★ここを string | boolean に変更！
  next: () => void;
  back: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setCurrentIndex: (index: number) => void;
  jumpTo: (index: number, flagName?: string, flagValue?: string | boolean) => void;
  saveGame: () => void; // ★セーブ関数
  loadGame: () => void; // ★ロード関数
};

export const useGameStore = create<GameState>((set, get) => ({
  currentIndex: 0,
  speed: 1.0,
  flags: {},

  next: () =>
    set((state) => {
      const currentItem = scenario[state.currentIndex];
      if (currentItem && currentItem.choices && currentItem.choices.length > 0) {
        return state; 
      }

      if (state.currentIndex < scenario.length) {
        return { currentIndex: state.currentIndex + 1 };
      }
      return state;
    }),

  back: () =>
    set((state) => {
      if (state.currentIndex > 0) {
        return { currentIndex: state.currentIndex - 1 };
      }
      return state;
    }),

  reset: () => set({ currentIndex: 0, flags: {} }),

  setSpeed: (speed) => set({ speed }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  jumpTo: (index, flagName, flagValue) =>
    set((state) => {
      const newFlags = { ...state.flags };
      if (flagName) {
        newFlags[flagName] = flagValue ?? true;
      }
      return {
        currentIndex: index,
        flags: newFlags,
      };
    }),

  // ★現在の状態を localStorage に保存
  saveGame: () => {
    const { currentIndex, flags } = get();
    const saveData = { currentIndex, flags };
    localStorage.setItem('novel_game_save', JSON.stringify(saveData));
    alert('セーブしました！');
  },

  // ★localStorage から状態を読み込み
  loadGame: () => {
    const savedData = localStorage.getItem('novel_game_save');
    if (!savedData) {
      alert('セーブデータが見つかりません');
      return;
    }
    try {
      const { currentIndex, flags } = JSON.parse(savedData);
      set({ currentIndex, flags });
      alert('ロードしました！');
    } catch (e) {
      console.error('セーブデータの読み込みに失敗しました', e);
    }
  },
}));