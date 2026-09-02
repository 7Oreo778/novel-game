type Props = {
  mode?: 'full' | 'split' | 'none';
  active?: 'left' | 'right' | 'both' | 'none';
  fullImg: string;
  doraImg: string;
  kiroImg: string;
};

export default function Chara({ mode, active, fullImg, doraImg, kiroImg }: Props) {
  if (!mode || mode === 'none') return null;

  return (
    <>
      {mode === 'full' && (
        <img className="character chara-center" src={fullImg} alt="一枚絵" />
      )}
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
}