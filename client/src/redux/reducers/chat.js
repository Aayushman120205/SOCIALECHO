import * as types from "../constants/chatConstants";
import { LOGOUT } from "../constants/authConstants";

const initialState = {
  conversations: [],
  messages: [],
  selectedConversation: null,
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
};

const moveConversationToTop = (conversations, message) => {
  const conversationId = message.conversationId?.toString();
  const existingConversation = conversations.find(
    (conversation) => conversation._id === conversationId
  );

  if (!existingConversation) {
    return conversations;
  }

  const updatedConversation = {
    ...existingConversation,
    lastMessageId: message,
    lastMessageAt: message.createdAt,
  };

  return [
    updatedConversation,
    ...conversations.filter(
      (conversation) => conversation._id !== conversationId
    ),
  ];
};

const upsertConversation = (conversations, conversation) => {
  if (!conversation?._id) {
    return conversations;
  }

  return [
    conversation,
    ...conversations.filter((item) => item._id !== conversation._id),
  ];
};

const chatReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case LOGOUT:
      return initialState;

    case types.GET_CONVERSATIONS_REQUEST:
      return {
        ...state,
        loadingConversations: true,
        error: null,
      };

    case types.GET_CONVERSATIONS_SUCCESS:
      return {
        ...state,
        conversations: payload || [],
        loadingConversations: false,
        error: null,
      };

    case types.GET_CONVERSATIONS_FAIL:
      return {
        ...state,
        loadingConversations: false,
        error: payload,
      };

    case types.GET_MESSAGES_REQUEST:
      return {
        ...state,
        loadingMessages: true,
        error: null,
      };

    case types.GET_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: payload || [],
        loadingMessages: false,
        error: null,
      };

    case types.GET_MESSAGES_FAIL:
      return {
        ...state,
        messages: [],
        loadingMessages: false,
        error: payload,
      };

    case types.SEND_MESSAGE_REQUEST:
      return {
        ...state,
        sendingMessage: true,
        error: null,
      };

    case types.SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        messages: [...state.messages, payload],
        conversations: moveConversationToTop(state.conversations, payload),
        sendingMessage: false,
        error: null,
      };

    case types.SEND_MESSAGE_FAIL:
      return {
        ...state,
        sendingMessage: false,
        error: payload,
      };

    case types.CREATE_OR_GET_CONVERSATION_SUCCESS:
      return {
        ...state,
        conversations: upsertConversation(state.conversations, payload),
        selectedConversation: payload,
        error: null,
      };

    case types.RECEIVE_MESSAGE_SUCCESS:
      if (state.messages.some((message) => message._id === payload._id)) {
        return state;
      }

      return {
        ...state,
        messages:
          state.selectedConversation?._id === payload.conversationId
            ? [...state.messages, payload]
            : state.messages,
        conversations: moveConversationToTop(state.conversations, payload),
        error: null,
      };

    case types.SELECT_CONVERSATION:
      return {
        ...state,
        selectedConversation: payload,
        error: null,
      };

    case types.CLEAR_SELECTED_CONVERSATION:
      return {
        ...state,
        selectedConversation: null,
        messages: [],
        loadingMessages: false,
        sendingMessage: false,
        error: null,
      };

    default:
      return state;
  }
};

export default chatReducer;
