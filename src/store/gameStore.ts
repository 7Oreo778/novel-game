import { create } from 'zustand';
import { scenario } from '../data/scenario';

type GameState = {
  currentIndex: number;
  speed: number;
  flags: { [key: string]: boolean }; // フラグ管理用の辞書
  next: () => void;
  back: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setCurrentIndex: (index: number) => void;
  jumpTo: (index: number, flagName?: string, flagValue?: boolean) => void; // 特定の場所へ飛ぶ＆フラグを立てる
};

export const useGameStore = create<GameState>((set) => ({
  currentIndex: 0,
  speed: 1.0,
  flags: {},

  // 次へ進む
  next: () =>
    set((state) => {
      // 現在のコマに選択肢がある場合は、勝手に次に進めないようにする
      const currentItem = scenario[state.currentIndex];
      if (currentItem && currentItem.choices && currentItem.choices.length > 0) {
        return state; 
      }

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
  reset: () => set({ currentIndex: 0, flags: {} }),

  // 再生速度の切り替え
  setSpeed: (speed) => set({ speed }),

  // インデックスの直接指定（セーブロード用など）
  setCurrentIndex: (index) => set({ currentIndex: index }),

  // 選択肢を選んだときの処理（指定インデックスへジャンプ ＋ フラグ保存）
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
}));