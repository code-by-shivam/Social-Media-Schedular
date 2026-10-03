import { apiRequest } from "./api";

export const getCampaigns = async () => {
  return apiRequest("/campaigns/");
};

export const getCampaign = async (campaignId) => {
  return apiRequest(`/campaigns/${campaignId}`);
};

export const createCampaign = async (campaignData) => {
  return apiRequest("/campaigns/", {
    method: "POST",
    body: JSON.stringify(campaignData),
  });
};

export const updateCampaign = async (campaignId, campaignData) => {
  return apiRequest(`/campaigns/${campaignId}`, {
    method: "PUT",
    body: JSON.stringify(campaignData),
  });
};

export const deleteCampaign = async (campaignId) => {
  return apiRequest(`/campaigns/${campaignId}`, {
    method: "DELETE",
  });
};

export const getCampaignTrackingSummary = async (campaignId) => {
  return apiRequest(`/campaigns/${campaignId}/tracking/summary`);
};

export const getCampaignTracking = async (campaignId) => {
  return apiRequest(`/campaigns/${campaignId}/tracking`);
};

export const getCampaignPerformance = async (campaignId) => {
  return apiRequest(`/campaigns/${campaignId}/performance`);
};

export const getCampaignComparison = async (campaignIds) => {
  return apiRequest("/campaigns/compare", {
    method: "POST",
    body: JSON.stringify({ campaign_ids: campaignIds }),
  });
};

export const calculateCampaignROI = async (campaignId, roiData) => {
  return apiRequest(`/campaigns/${campaignId}/roi`, {
    method: "POST",
    body: JSON.stringify(roiData),
  });
};

// ROI specific service methods
export const getCampaignROI = async (campaignId) => {
  return apiRequest(`/roi/campaigns/${campaignId}`);
};

export const compareCampaignROI = async (campaignIds) => {
  const queryParams = campaignIds.map(id => `campaign_ids=${id}`).join('&');
  return apiRequest(`/roi/compare?${queryParams}`);
};
