import styles from './Chara.module.css';

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
        <img className={`${styles.character} ${styles.center}`} src={fullImg} alt="一枚絵" />
      )}
      {mode === 'split' && (
        <>
          <img
            className={`${styles.character} ${styles.left} ${active === 'right' ? styles.inactive : ''}`}
            src={doraImg}
            alt="左キャラ"
          />
          <img
            className={`${styles.character} ${styles.right} ${active === 'left' ? styles.inactive : ''}`}
            src={kiroImg}
            alt="右キャラ"
          />
        </>
      )}
    </>
  );
}