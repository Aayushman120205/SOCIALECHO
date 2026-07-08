import { useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import MessageThreadSkeleton from "./MessageThreadSkeleton";

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

const getSenderId = (message) => {
  return typeof message.senderId === "object"
    ? message.senderId?._id
    : message.senderId;
};

const MessageThread = ({
  conversation,
  messages,
  currentUserId,
  onlineUserIds = [],
  loadingMessages,
  sendingMessage,
  onSendMessage,
  onBack,
}) => {
  const latestMessageRef = useRef(null);
  const participant = conversation.participants?.find(
    (user) => user?._id !== currentUserId
  );
  const participantName = getParticipantName(participant);
  const participantAvatar = getParticipantAvatar(participant);
  const isParticipantOnline = onlineUserIds.includes(
    participant?._id?.toString()
  );

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-white">
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
          aria-label="Back to conversations"
        >
          <FiArrowLeft />
        </button>
        <div className="relative shrink-0">
          {participantAvatar ? (
            <img
              src={participantAvatar}
              alt={participantName}
              className="h-10 w-10 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-semibold text-white">
              {participantName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
              isParticipantOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-gray-900">
            {participantName}
          </h2>
          <p className="text-xs text-gray-500">
            {isParticipantOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {loadingMessages ? (
          <MessageThreadSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <h3 className="text-base font-semibold text-gray-900">
              No messages yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Send the first message to {participantName}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={
                  getSenderId(message)?.toString() === currentUserId
                }
              />
            ))}
            <div ref={latestMessageRef} />
          </div>
        )}
      </div>

      <MessageComposer
        sendingMessage={sendingMessage}
        onSendMessage={onSendMessage}
      />
    </section>
  );
};

export default MessageThread;
