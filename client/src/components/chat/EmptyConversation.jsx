import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const EmptyConversation = ({ onStartConversation }) => {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border text-3xl text-primary">
        <HiOutlineChatBubbleLeftRight />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Your messages</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Select a conversation or start a new one from your SocialEcho network.
      </p>
      {onStartConversation ? (
        <button
          type="button"
          onClick={onStartConversation}
          className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          New message
        </button>
      ) : null}
    </div>
  );
};

export default EmptyConversation;
