import { API, handleApiError } from "./utils";

export const getConversations = async () => {
  try {
    const { data } = await API.get("/messages/conversations");
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createOrGetConversation = async (recipientId) => {
  try {
    const { data } = await API.post("/messages/conversations", {
      recipientId,
    });
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMessages = async (conversationId) => {
  try {
    const { data } = await API.get(
      `/messages/conversations/${conversationId}/messages`
    );
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const sendMessage = async (conversationId, content) => {
  try {
    const { data } = await API.post(
      `/messages/conversations/${conversationId}/messages`,
      { content }
    );
    return { error: null, data };
  } catch (error) {
    return handleApiError(error);
  }
};
