import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import EmptyConversation from "../components/chat/EmptyConversation";
import MessageThread from "../components/chat/MessageThread";
import MessageThreadSkeleton from "../components/chat/MessageThreadSkeleton";
import NewConversationModal from "../components/chat/NewConversationModal";
import {
  clearSelectedConversationAction,
  createOrGetConversationAction,
  getConversationsAction,
  getMessagesAction,
  receiveMessageAction,
  selectConversationAction,
  sendMessageAction,
} from "../redux/actions/chatActions";
import { getSocket, subscribeToPresence } from "../socket/socket";

const Messages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const currentUserId = useSelector((state) => state.auth?.userData?._id);
  const {
    conversations,
    messages,
    selectedConversation,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    error,
  } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getConversationsAction());
  }, [dispatch]);

  useEffect(() => {
    return subscribeToPresence(setOnlineUserIds);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    const handleMessageReceived = (message) => {
      dispatch(receiveMessageAction(message));
    };

    socket.on("message:received", handleMessageReceived);

    return () => {
      socket.off("message:received", handleMessageReceived);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!conversationId) {
      dispatch(clearSelectedConversationAction());
      return;
    }

    const conversation = conversations.find(
      (item) => item._id === conversationId
    );

    if (conversation) {
      dispatch(selectConversationAction(conversation));
      dispatch(getMessagesAction(conversationId));
    }
  }, [conversationId, conversations, dispatch]);

  const handleSelectConversation = (conversation) => {
    navigate(`/messages/${conversation._id}`);
  };

  const handleBackToConversations = () => {
    navigate("/messages");
  };

  const handleCreateConversation = async (recipientId) => {
    const conversation = await dispatch(
      createOrGetConversationAction(recipientId)
    );
    navigate(`/messages/${conversation._id}`);
  };

  const handleSendMessage = async (content) => {
    if (!selectedConversation?._id) {
      return;
    }

    await dispatch(sendMessageAction(selectedConversation._id, content));
  };

  return (
    <div className="mx-2 mt-1 overflow-hidden rounded-md border bg-white md:col-span-3">
      <div className="flex h-[78vh] min-h-[520px]">
        <ConversationList
          className={`${conversationId ? "hidden" : "flex"} w-full md:flex`}
          conversations={conversations}
          selectedConversation={selectedConversation}
          currentUserId={currentUserId}
          onlineUserIds={onlineUserIds}
          loading={loadingConversations}
          onStartConversation={() => setShowNewConversationModal(true)}
          onSelectConversation={handleSelectConversation}
        />

        <div
          className={`${
            conversationId ? "flex" : "hidden"
          } min-w-0 flex-1 md:flex`}
        >
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
              currentUserId={currentUserId}
              onlineUserIds={onlineUserIds}
              loadingMessages={loadingMessages}
              sendingMessage={sendingMessage}
              onBack={handleBackToConversations}
              onSendMessage={handleSendMessage}
            />
          ) : conversationId && loadingConversations ? (
            <section className="flex h-full min-w-0 flex-1 flex-col bg-white">
              <div className="border-b px-5 py-3">
                <div className="h-10 w-48 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <MessageThreadSkeleton />
              </div>
            </section>
          ) : (
            <EmptyConversation
              onStartConversation={() => setShowNewConversationModal(true)}
            />
          )}
        </div>
      </div>

      {error ? (
        <div className="border-t bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <NewConversationModal
        show={showNewConversationModal}
        currentUserId={currentUserId}
        onClose={() => setShowNewConversationModal(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default Messages;
