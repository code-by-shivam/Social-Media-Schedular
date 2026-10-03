import API_BASE_URL, { apiRequest, authHeader } from "./api";

export const getPosts = async () => {
  return apiRequest("/posts/");
};

export const getPost = async (postId) => {
  return apiRequest(`/posts/${postId}`);
};

export const createPost = async (postData) => {
  const formData = new FormData();
  formData.append("social_account_id", postData.social_account_id);
  formData.append("caption", postData.caption);

  if (postData.campaign_id) {
    formData.append("campaign_id", postData.campaign_id);
  }

  if (postData.title) {
    formData.append("title", postData.title);
  }

  formData.append("scheduled_time", postData.scheduled_time);

  if (postData.image) {
    formData.append("image", postData.image);
  }

  const response = await fetch(`${API_BASE_URL}/posts/`, {
    method: "POST",
    headers: authHeader(false),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create post");
  }

  return data;
};

export const deletePost = async (postId) => {
  return apiRequest(`/posts/${postId}`, {
    method: "DELETE",
  });
};

export const getDrafts = async () => {
  return apiRequest("/posts/drafts");
};

export const createDraft = async (draftData) => {
  const formData = new FormData();
  formData.append("social_account_id", draftData.social_account_id);

  if (draftData.campaign_id) {
    formData.append("campaign_id", draftData.campaign_id);
  }

  if (draftData.title) {
    formData.append("title", draftData.title);
  }

  if (draftData.caption) {
    formData.append("caption", draftData.caption);
  }

  if (draftData.image) {
    formData.append("image", draftData.image);
  }

  const response = await fetch(`${API_BASE_URL}/posts/draft`, {
    method: "POST",
    headers: authHeader(false),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create draft");
  }

  return data;
};

export const deleteDraft = async (draftId) => {
  return apiRequest(`/posts/drafts/${draftId}`, {
    method: "DELETE",
  });
};

export const scheduleDraft = async (draftId, scheduledTime) => {
  return apiRequest(`/posts/drafts/${draftId}/schedule`, {
    method: "POST",
    body: JSON.stringify({ scheduled_time: scheduledTime }),
  });
};
