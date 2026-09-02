// 画像の読み込み
import doraImg from '../assets/images/characters/dora.webp';
import kiroImg from '../assets/images/characters/kiro.webp';
import fullImg from '../assets/images/characters/full.webp';

// ボイスの読み込み
import voice00 from '../assets/audio/voices/000_narr_intro.mp3';
import voice01 from '../assets/audio/voices/001_metan_greet.mp3';
import voice02 from '../assets/audio/voices/002_zunda_greet.mp3';
import voice03m from '../assets/audio/voices/003_metan_both.mp3';
import voice03z from '../assets/audio/voices/004_zunda_both.mp3';

// 画像オブジェクトをひとまとめにしてエクスポート
export const images = {
  doraImg,
  kiroImg,
  fullImg,
};

// 型定義
export type VoiceConfig = {
  text: string;
  speakerId: number;
};

export type Scenario = {
  name: string;
  text: string;
  mode?: 'full' | 'split' | 'none';
  active?: 'left' | 'right' | 'both' | 'none';
  voice?: string | string[] | VoiceConfig;
};

// シナリオデータ本体
export const scenario: Scenario[] = [
  { name: "", text: "画面をクリックしてスタート" },
  { name: "", text: "物語が始まる……", mode: "full", voice: voice00 },
  { name: "四国めたん", text: "あら、こんにちはずんだもん。", mode: "split", active: "left", voice: voice01 },
  { name: "ずんだもん", text: "めたん！こんにちはなのだ！速度確認のために長文を喋るのだ！吾輩は豆である。名前はもう有る。どこで生れたかとんと見当がつかぬ。おそらく東北地方であろう。", mode: "split", active: "right", voice: voice02 },
  { name: "二人", text: "2人同時に喋るときは両方明るくできる！", mode: "split", active: "both", voice: [voice03m, voice03z] },
  { name: "ずんだもん", text: "ここからはAPIでの音声入力なのだ！", voice: { text: "ここからはエーピーアイでの音声入力なのだ！", speakerId: 3 } },
  { name: "四国めたん", text: "あら、VOICEVOXを起動しておかないと声は出ないわよ。あとvoicesフォルダにmp3を入れないと自分以外は聞けないから忘れないようにね。", voice: { text: "あら、ボイスボックスを起動しておかないと声は出ないわよ。あとボイシーズフォルダにエムピースリーを入れないと自分以外は聞けないから忘れないようにね.", speakerId: 2 } },
];