interface TemporalMessage {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
  username: string;
}

export const MessageList = ({
  messages,
}: {
  messages: TemporalMessage[] | undefined;
}) => {
  // TODO : Cambiar esto a la interfaz "Message"
  return (
    <div>
      {messages?.map((message) => (
        <p key={message.id}>
          <strong>{message.username}</strong> {message.text}
        </p>
      ))}
    </div>
  );
};
