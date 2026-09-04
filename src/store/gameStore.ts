import { create } from 'zustand';
import { scenario } from '../data/scenario';

type GameState = {
  currentIndex: number;
  speed: number;
  next: () => void;
  back: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setCurrentIndex: (index: number) => void;
};

export const useGameStore = create<GameState>((set) => ({
  currentIndex: 0,
  speed: 1.0,

  // 次へ進む
  next: () =>
    set((state) => {
      if (state.currentIndex < scenario.length) {
        return { currentIndex: state.currentIndex + 1 };
      }
      return state;
    }),

  // 1つ戻る
  back: () =>
    set((state) => {
      if (state.currentIndex > 0) {
        return { currentIndex: state.currentIndex - 1 };
      }
      return state;
    }),

  // 最初からリセット
  reset: () => set({ currentIndex: 0 }),

  // 再生速度の切り替え
  setSpeed: (speed) => set({ speed }),

  // インデックスの直接指定（セーブロード用など）
  setCurrentIndex: (index) => set({ currentIndex: index }),
}));