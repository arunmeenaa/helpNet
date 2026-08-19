import request from "./apiClient";



export const sendMessage = (data) => {
  const payload = {
    ...data,
    postType: data.postType || "request",
  };

  

  return request("/api/messages/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getInbox = () => {
  return request("/api/messages/inbox");
};

export const getConversation = (userId, postType, postId) => {
  return request(
    `/api/messages/conversation/${userId}/${postType}/${postId}`
  );
};

export const getMessages = () => {
  return request("/api/messages");
};

export const getUnreadCount = () => {
  return request("/api/messages/unread-count");
};

export const markMessageAsRead = (id) => {
  return request(`/api/messages/${id}/read`, {
    method: "PATCH",
  });
};