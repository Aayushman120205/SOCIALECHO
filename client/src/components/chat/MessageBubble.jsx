import {
  formatFullTimestamp,
  formatMessageTimestamp,
} from "../../utils/chatTime";

const MessageBubble = ({ message, isOwnMessage }) => {
  return (
    <div
      className={`flex w-full ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isOwnMessage
            ? "rounded-br-md bg-primary text-white"
            : "rounded-bl-md bg-gray-100 text-gray-800"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          title={formatFullTimestamp(message.createdAt)}
          className={`mt-1 text-right text-[11px] ${
            isOwnMessage ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {formatMessageTimestamp(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
