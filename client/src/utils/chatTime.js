const getDate = (date) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isSameDay = (firstDate, secondDate) => {
  return firstDate.toDateString() === secondDate.toDateString();
};

const getStartOfDay = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatTime = (date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatConversationTimestamp = (date) => {
  const messageDate = getDate(date);

  if (!messageDate) {
    return "";
  }

  const now = new Date();

  if (isSameDay(messageDate, now)) {
    return formatTime(messageDate);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(messageDate, yesterday)) {
    return "Yesterday";
  }

  const daysDifference =
    (getStartOfDay(now) - getStartOfDay(messageDate)) / (1000 * 60 * 60 * 24);

  if (daysDifference < 7) {
    return messageDate.toLocaleDateString([], { weekday: "short" });
  }

  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year:
      messageDate.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
};

export const formatMessageTimestamp = (date) => {
  const messageDate = getDate(date);

  if (!messageDate) {
    return "";
  }

  const now = new Date();

  if (isSameDay(messageDate, now)) {
    return formatTime(messageDate);
  }

  return `${messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })}, ${formatTime(messageDate)}`;
};

export const formatFullTimestamp = (date) => {
  const messageDate = getDate(date);

  if (!messageDate) {
    return "";
  }

  return messageDate.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
