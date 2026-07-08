import { useState } from "react";
import { FiSend } from "react-icons/fi";

const MessageComposer = ({ sendingMessage, onSendMessage }) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || sendingMessage) {
      return;
    }

    await onSendMessage(trimmedContent);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-3">
      <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          type="text"
          maxLength={2000}
          placeholder={sendingMessage ? "Sending..." : "Message..."}
          disabled={sendingMessage}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={!content.trim() || sendingMessage}
          className="text-xl text-primary disabled:cursor-not-allowed disabled:text-gray-300"
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
    </form>
  );
};

export default MessageComposer;
