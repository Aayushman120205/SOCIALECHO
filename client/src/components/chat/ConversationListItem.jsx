import { memo } from "react";
import { formatConversationTimestamp } from "../../utils/chatTime";

const getParticipantName = (participant) => {
  return (
    participant?.name ||
    participant?.fullname ||
    participant?.username ||
    "SocialEcho user"
  );
};

const getParticipantAvatar = (participant) => {
  return participant?.avatar || participant?.profilePicture || "";
};

const ConversationListItem = ({
  conversation,
  currentUserId,
  onlineUserIds = [],
  isSelected,
  onSelect,
}) => {
  const participant = conversation.participants?.find(
    (user) => user?._id !== currentUserId
  );
  const participantName = getParticipantName(participant);
  const participantAvatar = getParticipantAvatar(participant);
  const lastMessage = conversation.lastMessageId?.content || "No messages yet";
  const isParticipantOnline = onlineUserIds.includes(
    participant?._id?.toString()
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition hover:bg-gray-50 ${
        isSelected ? "bg-primary/10" : "bg-white"
      }`}
    >
      <div className="relative shrink-0">
        {participantAvatar ? (
          <img
            src={participantAvatar}
            alt={participantName}
            className="h-12 w-12 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
            {participantName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
            isParticipantOnline ? "bg-green-500" : "bg-gray-300"
          }`}
          title={isParticipantOnline ? "Online" : "Offline"}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-gray-800">
            {participantName}
          </h3>
          <span className="shrink-0 text-xs text-gray-400">
            {formatConversationTimestamp(
              conversation.lastMessageAt || conversation.updatedAt
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isParticipantOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <p className="truncate text-sm text-gray-500">
            {isParticipantOnline ? "Online" : "Offline"} · {lastMessage}
          </p>
        </div>
      </div>
    </button>
  );
};

export default memo(ConversationListItem);
