import { apiRequest } from "./api";

export const getPublishingQueue = async () => {
  return apiRequest("/publishing-queue/");
};

export const cancelQueueItem = async (queueId) => {
  return apiRequest(`/publishing-queue/${queueId}/cancel`, {
    method: "PATCH",
  });
};

export const retryQueueItem = async (queueId) => {
  return apiRequest(`/publishing-queue/${queueId}/retry`, {
    method: "POST",
  });
};

export const updateQueuePriority = async (queueId, priority) => {
  return apiRequest(`/publishing-queue/${queueId}/priority`, {
    method: "PATCH",
    body: JSON.stringify({ priority }),
  });
};
