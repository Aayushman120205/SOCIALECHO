import * as api from "../api/chatAPI";
import * as types from "../constants/chatConstants";

export const getConversationsAction = () => async (dispatch) => {
  dispatch({ type: types.GET_CONVERSATIONS_REQUEST });

  try {
    const { error, data } = await api.getConversations();

    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: types.GET_CONVERSATIONS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: types.GET_CONVERSATIONS_FAIL,
      payload: error.message,
    });
  }
};

export const getMessagesAction = (conversationId) => async (dispatch) => {
  dispatch({ type: types.GET_MESSAGES_REQUEST });

  try {
    const { error, data } = await api.getMessages(conversationId);

    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: types.GET_MESSAGES_SUCCESS,
      payload: data.messages || [],
    });
  } catch (error) {
    dispatch({
      type: types.GET_MESSAGES_FAIL,
      payload: error.message,
    });
  }
};

export const sendMessageAction =
  (conversationId, content) => async (dispatch) => {
    dispatch({ type: types.SEND_MESSAGE_REQUEST });

    try {
      const { error, data } = await api.sendMessage(conversationId, content);

      if (error) {
        throw new Error(error);
      }

      dispatch({
        type: types.SEND_MESSAGE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: types.SEND_MESSAGE_FAIL,
        payload: error.message,
      });
    }
  };

export const createOrGetConversationAction =
  (recipientId) => async (dispatch) => {
    const { error, data } = await api.createOrGetConversation(recipientId);

    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: types.CREATE_OR_GET_CONVERSATION_SUCCESS,
      payload: data,
    });

    return data;
  };

export const selectConversationAction = (conversation) => ({
  type: types.SELECT_CONVERSATION,
  payload: conversation,
});

export const clearSelectedConversationAction = () => ({
  type: types.CLEAR_SELECTED_CONVERSATION,
});

export const receiveMessageAction = (message) => ({
  type: types.RECEIVE_MESSAGE_SUCCESS,
  payload: message,
});
