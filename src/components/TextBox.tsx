import styles from './TextBox.module.css';

type Props = {
  speaker: string;
  displayText: string;
};

export default function TextBox({ speaker, displayText }: Props) {
  return (
    <div className={styles.box}>
      <div className={styles.speaker}>{speaker}</div>
      <div className={styles.message}>{displayText}</div>
    </div>
  );
}