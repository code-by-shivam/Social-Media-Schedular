import { apiRequest } from "./api";

export const getPostAnalytics = async (postId) => {
  return apiRequest(`/analytics/posts/${postId}`);
};

export const getPostEngagement = async (postId) => {
  return apiRequest(`/analytics/posts/${postId}/engagement`);
};

export const getCampaignEngagement = async (campaignId) => {
  return apiRequest(`/analytics/campaigns/${campaignId}/engagement`);
};

export const getCampaignPerformance = async (campaignId) => {
  return apiRequest(`/analytics/campaigns/${campaignId}/performance`);
};

export const getAudienceGrowth = async (socialAccountId) => {
  return apiRequest(`/analytics/social-accounts/${socialAccountId}/audience-growth`);
};

export const getAdminDashboard = async () => {
  return apiRequest("/admin/dashboard");
};

// New overall analytics endpoints
export const getOverallAnalytics = async (timeRange = '7d') => {
  return apiRequest(`/analytics/overall?time_range=${timeRange}`);
};

export const getUserPerformanceMetrics = async () => {
  return apiRequest("/analytics/user/performance");
};

export const getCrossPlatformAnalytics = async () => {
  return apiRequest("/analytics/cross-platform");
};
