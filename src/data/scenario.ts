// 画像の読み込み
import doraImg from '../assets/images/characters/dora.webp';
import kiroImg from '../assets/images/characters/kiro.webp';
import fullImg from '../assets/images/characters/full.webp';

// ボイスの読み込み（前半のMP3用）
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

// 選択肢の型
export type Choice = {
  text: string;           
  nextIndex: number;      
  flagName?: string;      
  flagValue?: boolean | string;    
};

// シナリオ1コマの型定義
export type Scenario = {
  name: string;
  text: string;
  mode?: 'full' | 'split' | 'none';
  active?: 'left' | 'right' | 'both' | 'none';
  voice?: string | string[] | VoiceConfig;
  choices?: Choice[];     
};

// シナリオデータ本体
export const scenario: Scenario[] = [
  { name: "", text: "画面をクリックしてスタート" },
  { name: "", text: "物語が始まる……", mode: "full", voice: voice00 },
  { name: "四国めたん", text: "あら、こんにちはずんだもん。", mode: "split", active: "left", voice: voice01 },
  { name: "ずんだもん", text: "めたん！こんにちはなのだ！速度確認のために長文を喋るのだ！吾輩は豆である。名前はもう有る。どこで生れたかとんと見当がつかぬ。おそらく東北地方であろう。", mode: "split", active: "right", voice: voice02 },
  { name: "二人", text: "2人同時に喋るときは両方明るくできる！", mode: "split", active: "both", voice: [voice03m, voice03z] },
  { name: "ずんだもん", text: "ここからはAPIでの音声入力なのだ！", voice: { text: "ここからはエーピーアイでの音声入力なのだ！", speakerId: 3 } },
  { name: "四国めたん", text: "あら、voicesフォルダにmp3を入れないと自分以外は聞けないから忘れないようにね", voice: { text: "あら、ボイシーズフォルダにエムピースリーを入れないと自分以外は聞けないから忘れないようにね", speakerId: 2 } },
  
  // [7] 最初の選択肢
  { 
    name: "", 
    text: "ここで分岐の選択肢が発生する。どれを選ぶ？", 
    voice: { text: "ここでぶんきのせんたくしがはっせいする。どれをえらぶ？", speakerId: 9 }, 
    choices: [
      { text: "右の道をいく", nextIndex: 8, flagName: "route", flagValue: "right" },
      { text: "左の道をいく", nextIndex: 10, flagName: "route", flagValue: "left" },
      { text: "禍々しい洞窟に入る", nextIndex: 12, flagName: "route", flagValue: "caveFirst" }
    ]
  },

  // === 【右ルート：りんご入手】 (index 8, 9) ===
  { 
    name: "ずんだもん", 
    text: "右の道を進んできたのだ！おっ、なぜかポツンと「真っ赤なりんご」が落ちているぞ？", 
    voice: { text: "みぎのみちをすすんできたのだ！おっ、なぜかぽつんと「まっかなりんご」がおちているぞ？", speakerId: 3 },
  },
  { 
    name: "ずんだもん", 
    text: "「りんご」を手に入れた！ 何に使うのか分からないが、持っておこう。", 
    voice: { text: "りんごをてにいれた！なににつかうのかわからないが、もっておこう。", speakerId: 3 },
    choices: [
      { text: "先へ進む", nextIndex: 16, flagName: "hasApple", flagValue: true }
    ]
  },

  // === 【左ルート：バール入手】 (index 10, 11) ===
  { 
    name: "四国めたん", 
    text: "左の道を進むわよ。……うわ、何故「バール」が転がっているのかしら…", 
    voice: { text: "ひだりのみちをすすむわよ。……うわ、なぜ「ばーる」がころがっているのかしら…", speakerId: 2 }
  },
  { 
    name: "", 
    text: "「バール」を手に入れたわ！ 何に使うのか分からないが、持っておきましょう。", 
    voice: { text: "バールをてにいれたわ！なににつかうのかわからないが、もっておきましょう。", speakerId: 2 },
    choices: [
      { text: "先へ進む", nextIndex: 16, flagName: "hasCrowbar", flagValue: true }
    ]
  },

  // === 【最初に洞窟ルート】 (index 12, 13, 14, 15) ===
  { 
    name: "", 
    text: "禍々しい洞窟の奥へと足を踏み入れた。ひんやりとした空気が肌を刺す……。",
    voice: { text: "まがまがしいどうくつのくへとあしをふみいれた。ひんやりとしたくうきがはだをさす……。", speakerId: 9 }
  },
  { 
    name: "", 
    text: "少し進むと立派な宝箱があるが、厳重な鍵穴がついていて今のままでは開かない。", 
    voice: { text: "すこしすすむとりっぱなたからばこがあるが、げんじゅうなかぎあながついていていまのままではあかない。", speakerId: 9 },
    choices: [
      { text: "引き返す", nextIndex: 14 },
      { text: "もっと奥へ進む", nextIndex: 15 }
    ]
  },
  // [14] 引き返して日常エンド
  { 
    name: "", 
    text: "これ以上深追いするのはやめておこう。二人は無事に街へ戻り、平穏な日常を取り戻した。\n【日常エンド：END A】",
    voice: { text: "これいじょうふかおいするのはやめておこう。ふたりはぶじにまちにもどり、へいおんなにちじょうをとりもどした。", speakerId: 9 },
    choices: [
      { text: "最初に戻る", nextIndex: 0 }
    ]
  },
  // [15] 奥へ進んで鍵をゲット
  { 
    name: "", 
    text: "洞窟の最奥で「古い鍵」を手に入れた！ これで宝箱が開けられるはずだ。\n【宝箱エンド：END B】",
    voice: { text: "どうくつのさいおうでふるいかぎをてにいれた！これでたからばこがあけられるはずだ。", speakerId: 9 }
  },

  // === 【共通の合流地点：右・左ルートから来た人用】 (index 16, 17, 18) ===
  { 
    name: "", 
    text: "道を進むと、先ほど見た「禍々しい洞窟」の入り口へと繋がっていた。どうする？",
    voice: { text: "みちをすすむと、さきほどみたまがまがしいどうくつのいりぐちへとつながっていた。どうする？", speakerId: 9 },
    choices: [
      { text: "街へ戻る", nextIndex: 17 },
      { text: "禍々しい洞窟へ入る", nextIndex: 18 }
    ]
  },
  { 
    name: "", 
    text: "冒険はここまでにして、街へ戻ることにした。平穏な日常が一番だね。\n【日常エンド：END C】",
    voice: { text: "ぼうけんはここまでにして、まちにもどることにした。へいおんななちじょうがいちばんだね。", speakerId: 9 },
    choices: [
      { text: "最初に戻る", nextIndex: 0 }
    ]
  },
  { 
    name: "", 
    text: "再び洞窟に入り、例の宝箱の前にやってきた。さて、どうやって開けようか……？",
    voice: { text: "ふたたびどうくつはいり、れいのかぎのまえにやってきた。さて、どうやってあけようか……？", speakerId: 9 }
  },

  // === 【宝箱の解放・所持アイテムによる分岐エンド】 (index 19) ===あとで所持フラグをつける！
  {
    name: "",
    text: "持ってきたアイテムやこれまでの選択によって、行動が変わる……！",
    voice: { text: "もってきたあいてむやこれまでのせんたくによって、こうどうがかわる……！", speakerId: 9 },
    choices: [
      { text: "りんごを試す", nextIndex: 20, flagName: "openAttempt", flagValue: "apple" },
      { text: "バールでこじ開ける", nextIndex: 21, flagName: "openAttempt", flagValue: "crowbar" },
      { text: "古い鍵を使う", nextIndex: 22, flagName: "openAttempt", flagValue: "key" }
    ]
  },

  // [20] りんごEND
  {
    name: "",
    text: "宝箱の裏に何故かりんごをはめることができ、中から大量のお宝とりんごジュースが出てきた！\n【りんごEND】",
    voice: { text: "たからばこのうらになぜかりんごをはめることができ、なかからたいりょうのおたからとりんごじゅーすがでてきた！りんごえんど", speakerId: 3 },
    choices: [
      { text: "最初に戻る", nextIndex: 0 }
    ]
  },

  // [21] バールEND
  {
    name: "",
    text: "ゴリ押しでバールを鍵穴に突っ込み、力任せにこじ開けた！バキバキに壊れたが中からお宝ザクザクだ！\n【バールEND】",
    voice: { text: "ごりおしでばーるをかぎあなにをつっこみ、ちからまかせにこじあけた！ばきばきにこわれたがなかからおたからざくざくだ！ばーるえんど。", speakerId: 2 },
    choices: [
      { text: "最初に戻る", nextIndex: 0 }
    ]
  },

  // [22] 鍵END
  {
    name: "",
    text: "最奥で見つけた「古い鍵」を差し込むと、カチリと音を立てて完璧に宝箱が開いた！中には眩い秘宝が眠っていた。\n【鍵END】",
    voice: { text: "さいおうで見つけたふるいかぎをさしこむと、かちりとおとをたててかんぺきにたからばこがひらいた！なかにはまばゆいひほうが眠っていた。かぎえんど。", speakerId: 9 },
    choices: [
      { text: "最初に戻る", nextIndex: 0 }
    ]
  }
];