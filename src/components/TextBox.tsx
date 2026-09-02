type Props = {
  speaker: string;
  displayText: string;
};

export default function TextBox({ speaker, displayText }: Props) {
  return (
    <div id="message-box">
      <div id="speaker">{speaker}</div>
      <div id="message">{displayText}</div>
    </div>
  );
}