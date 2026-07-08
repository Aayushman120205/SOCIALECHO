import { FiEdit } from "react-icons/fi";
import ConversationListItem from "./ConversationListItem";
import ConversationListSkeleton from "./ConversationListSkeleton";

const ConversationList = ({
  conversations,
  selectedConversation,
  currentUserId,
  onlineUserIds,
  loading,
  className = "",
  onStartConversation,
  onSelectConversation,
}) => {
  return (
    <aside className={`h-full flex-col border-r bg-white md:w-80 ${className}`}>
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <button
          type="button"
          onClick={onStartConversation}
          className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 hover:text-primary"
          aria-label="Start new conversation"
          title="New message"
        >
          <FiEdit />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <ConversationListSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-5 py-8 text-center">
            <h2 className="text-base font-semibold text-gray-900">
              No conversations yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Start a chat with someone from SocialEcho.
            </p>
            <button
              type="button"
              onClick={onStartConversation}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              New message
            </button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation._id}
              conversation={conversation}
              currentUserId={currentUserId}
              onlineUserIds={onlineUserIds}
              isSelected={selectedConversation?._id === conversation._id}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
