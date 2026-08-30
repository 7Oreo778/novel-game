type Props = {
  mode?: 'full' | 'split' | 'none';
  active?: 'left' | 'right' | 'both' | 'none';
  fullImg: string;
  doraImg: string;
  kiroImg: string;
};

export const CharacterArea = ({ mode, active, fullImg, doraImg, kiroImg }: Props) => {
  if (!mode || mode === 'none') return null;

  return (
    <>
      {/* 1枚絵（full）モード */}
      {mode === 'full' && (
        <img className="character chara-center" src={fullImg} alt="一枚絵" />
      )}

      {/* 立ち絵2分割（split）モード */}
      {mode === 'split' && (
        <>
          <img
            className={`character chara-left ${active === 'right' ? 'inactive' : ''}`}
            src={doraImg}
            alt="左キャラ"
          />
          <img
            className={`character chara-right ${active === 'left' ? 'inactive' : ''}`}
            src={kiroImg}
            alt="右キャラ"
          />
        </>
      )}
    </>
  );
};