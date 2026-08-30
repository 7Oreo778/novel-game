type Props = {
  speaker: string;
  displayText: string;
};

export const MessageWindow = ({ speaker, displayText }: Props) => {
  return (
    <div id="message-box">
      <div id="speaker">{speaker}</div>
      <div id="message">{displayText}</div>
    </div>
  );
};