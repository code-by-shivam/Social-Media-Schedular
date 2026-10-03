const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "access_token";

const DEV_USERS = {
  "development-admin-session": {
    id: 1,
    name: "System Administrator",
    email: "admin@socialpilot.com",
    role: "Administrator",
    status: "Active",
    phone: "+91 9876543210",
    location: "Coimbatore",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    bio: "Operationally sharp and focused on the platform health of every campaign.",
  },
  "development-admin-inactive-session": {
    id: 2,
    name: "Priya Nair",
    email: "admin2@socialpilot.com",
    role: "Administrator",
    status: "Inactive",
    phone: "+91 9811122233",
    location: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    bio: "Blends governance with strong editorial planning and team alignment.",
  },
  "development-creator-session": {
    id: 3,
    name: "Alicia Grant",
    email: "creator@socialpilot.com",
    role: "Content Creator",
    status: "Active",
    phone: "+91 9000011111",
    location: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
    bio: "Builds story-led content systems with a strong audience-first creative direction.",
  },
  "development-creator-inactive-session": {
    id: 4,
    name: "Rohan Mehta",
    email: "creator2@socialpilot.com",
    role: "Content Creator",
    status: "Inactive",
    phone: "+91 9099988877",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    bio: "Creates campaign visuals and short-form stories with strong performance instincts.",
  },
  "development-business-session": {
    id: 5,
    name: "Maya Brooks",
    email: "buser@socialpilot.com",
    role: "Business User",
    status: "Active",
    phone: "+91 9123456780",
    location: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    bio: "Connects sales goals, customer journeys, and content performance into one rhythm.",
  },
  "development-business-inactive-session": {
    id: 6,
    name: "Sanjay Patel",
    email: "buser2@socialpilot.com",
    role: "Business User",
    status: "Inactive",
    phone: "+91 9345678901",
    location: "Pune",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
    bio: "Tracks revenue impact and campaign efficiency with a practical, data-led lens.",
  },
  "development-marketing-session": {
    id: 7,
    name: "Elena Pierce",
    email: "marketing@socialpilot.com",
    role: "Marketing Team",
    status: "Active",
    phone: "+91 9988776655",
    location: "Chennai",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    bio: "Turns audience insight into low-noise campaign ideas that move fast and convert well.",
  },
  "development-marketing-inactive-session": {
    id: 8,
    name: "Aarav Iyer",
    email: "marketing2@socialpilot.com",
    role: "Marketing Team",
    status: "Inactive",
    phone: "+91 9055500011",
    location: "Kochi",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    bio: "Focuses on launch planning, reporting clarity, and audience retention across campaigns.",
  },
};

const DEV_MOCK_ACCOUNTS = [
  {
    id: 1,
    platform: "LinkedIn",
    username: "socialpilot-admin",
    name: "LinkedIn Studio",
    followers: 182400,
    posts: 148,
    engagement: 8.6,
  },
  {
    id: 2,
    platform: "Instagram",
    username: "creator.studio",
    name: "Instagram Editorial",
    followers: 94200,
    posts: 312,
    engagement: 11.4,
  },
  {
    id: 3,
    platform: "Facebook",
    username: "brand.page.socialpilot",
    name: "Facebook Page",
    followers: 56700,
    posts: 203,
    engagement: 6.9,
  },
  {
    id: 4,
    platform: "Twitter",
    username: "@socialpilotx",
    name: "X Channel",
    followers: 76400,
    posts: 421,
    engagement: 7.8,
  },
  {
    id: 5,
    platform: "YouTube",
    username: "socialpilot.video",
    name: "YouTube Channel",
    followers: 231000,
    posts: 96,
    engagement: 12.2,
  },
];

const DEV_MOCK_POSTS = [
  {
    post_id: 101,
    social_account_id: 1,
    caption: "Launching our new editorial sprint with smarter publishing rhythms for the week ahead.",
    title: "Editorial sprint kickoff",
    status: "SCHEDULED",
    scheduled_time: "2026-09-10T09:30:00",
    has_image: true,
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    updated_at: "2026-09-08T09:30:00Z",
  },
  {
    post_id: 102,
    social_account_id: 2,
    caption: "Behind the scenes: aligning creative assets and audience stories before our next campaign push.",
    title: "Studio prep",
    status: "QUEUED",
    scheduled_time: "2026-09-11T14:00:00",
    has_image: true,
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    updated_at: "2026-09-08T12:05:00Z",
  },
  {
    post_id: 103,
    social_account_id: 3,
    caption: "A quick reminder that every campaign becomes stronger when clarity and consistency lead the process.",
    title: "Campaign consistency",
    status: "DRAFT",
    scheduled_time: "2026-09-12T11:15:00",
    has_image: false,
    updated_at: "2026-09-07T15:20:00Z",
  },
  {
    post_id: 104,
    social_account_id: 4,
    caption: "Community-first content works best when the story is simple, sharp, and timely.",
    title: "Audience-first content",
    status: "SCHEDULED",
    scheduled_time: "2026-09-13T18:45:00",
    has_image: true,
    image_url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    updated_at: "2026-09-08T18:45:00Z",
  },
  {
    post_id: 105,
    social_account_id: 5,
    caption: "Short-form momentum is growing across video channels, and the next wave of storytelling is already being planned.",
    title: "Video performance wrap",
    status: "QUEUED",
    scheduled_time: "2026-09-14T20:00:00",
    has_image: true,
    image_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    updated_at: "2026-09-09T08:10:00Z",
  },
];

const DEV_MOCK_DRAFTS = [
  {
    post_id: 201,
    social_account_id: 2,
    title: "Creator story idea",
    caption: "A short, human-centered story highlighting how audiences discover our product in everyday moments.",
    status: "Draft",
    updated_at: "2026-09-09T09:05:00Z",
  },
  {
    post_id: 202,
    social_account_id: 1,
    title: "Executive note",
    caption: "Reusable weekly update for leadership: audience growth, campaign momentum, and key opportunities.",
    status: "Draft",
    updated_at: "2026-09-08T17:40:00Z",
  },
  {
    post_id: 203,
    social_account_id: 3,
    title: "Campaign teaser",
    caption: "Tease the next launch with customer proof and a concise value statement that matches the new positioning.",
    status: "Draft",
    updated_at: "2026-09-07T13:25:00Z",
  },
];

const DEV_MOCK_QUEUE = [
  {
    queue_id: 301,
    post_id: 101,
    status: "QUEUED",
    scheduled_at: "2026-09-10T09:30:00Z",
  },
  {
    queue_id: 302,
    post_id: 102,
    status: "SCHEDULED",
    scheduled_at: "2026-09-11T14:00:00Z",
  },
  {
    queue_id: 303,
    post_id: 105,
    status: "QUEUED",
    scheduled_at: "2026-09-14T20:00:00Z",
  },
];

const DEV_MOCK_CAMPAIGNS = [
  {
    id: 1,
    name: "Q3 Brand Lift",
    status: "Active",
    objective: "Increase engagement across key channels",
    budget: 12000,
    start_date: "2026-08-01",
    end_date: "2026-09-30",
  },
  {
    id: 2,
    name: "Creator Spotlight",
    status: "Planning",
    objective: "Showcase social proof and recurring content themes",
    budget: 9000,
    start_date: "2026-09-15",
    end_date: "2026-10-30",
  },
];

const DEV_ADMIN_DASHBOARD = {
  total_users: 3,
  total_posts: 24,
  total_campaigns: 6,
  connected_accounts: 4,
};

const DEV_OVERALL_METRICS = {
  average_engagement_rate: 7.8,
  total_engagements: 18420,
  total_followers: 65400,
  total_reach: 128000,
  monthly_growth: 12.4,
};

export default API_BASE_URL;

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const authHeader = (includeJson = true) => {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const normalizeRole = (role) => {
  if (role === "Admin") {
    return "Administrator";
  }

  if (role === "Content Creator") {
    return "Content Creator";
  }

  if (role === "Business User") {
    return "Business User";
  }

  if (role === "Marketing Team") {
    return "Marketing Team";
  }

  return role;
};

const getDevUserFromToken = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  return DEV_USERS[token] || null;
};

const getDevMockResponse = (path, options = {}) => {
  const lowerPath = path.toLowerCase();
  const user = getDevUserFromToken();

  if (path === "/auth/login") {
    return {
      access_token: user?.token || "development-admin-session",
      user: user || DEV_USERS["development-admin-session"],
    };
  }

  if (path === "/auth/logout") {
    return { success: true };
  }

  if (path === "/users/me") {
    return {
      user: user || DEV_USERS["development-admin-session"],
    };
  }

  if (path === "/users/") {
    return {
      users: Object.values(DEV_USERS),
    };
  }

  if (lowerPath === "/posts/" || lowerPath === "/posts") {
    return { posts: DEV_MOCK_POSTS };
  }

  if (lowerPath === "/posts/drafts" || lowerPath === "/posts/drafts/") {
    return { drafts: DEV_MOCK_DRAFTS };
  }

  if (lowerPath === "/publishing-queue/" || lowerPath === "/publishing-queue") {
    return { queue: DEV_MOCK_QUEUE };
  }

  if (lowerPath.startsWith("/posts/") && lowerPath.includes("/image")) {
    const postId = Number(path.split("/").filter(Boolean).at(-2));
    const post = DEV_MOCK_POSTS.find((entry) => entry.post_id === postId) || DEV_MOCK_POSTS[0];

    return {
      ok: true,
      image: post.image_url || null,
    };
  }

  if (lowerPath.startsWith("/posts/") && !lowerPath.endsWith("/image")) {
    const postId = Number(path.split("/").filter(Boolean).at(-1));
    const post = DEV_MOCK_POSTS.find((entry) => entry.post_id === postId) || DEV_MOCK_POSTS[0];

    return { post };
  }

  if (lowerPath === "/social-accounts/" || lowerPath === "/social-accounts") {
    return { accounts: DEV_MOCK_ACCOUNTS };
  }

  if (lowerPath === "/campaigns/" || lowerPath === "/campaigns") {
    return { campaigns: DEV_MOCK_CAMPAIGNS };
  }

  if (lowerPath.startsWith("/campaigns/") && !lowerPath.includes("/tracking") && !lowerPath.includes("/performance") && !lowerPath.includes("/roi")) {
    const campaignId = Number(path.split("/").filter(Boolean).at(-1));
    const campaign = DEV_MOCK_CAMPAIGNS.find((entry) => entry.id === campaignId) || DEV_MOCK_CAMPAIGNS[0];

    return { campaign };
  }

  if (lowerPath === "/analytics/overall") {
    return {
      overall_metrics: DEV_OVERALL_METRICS,
    };
  }

  if (lowerPath === "/admin/dashboard") {
    return { dashboard: DEV_ADMIN_DASHBOARD };
  }

  if (lowerPath === "/analytics/user/performance") {
    return {
      performance: {
        engagement_rate: 7.8,
        reach: 129000,
        conversions: 842,
      },
    };
  }

  if (lowerPath === "/analytics/cross-platform") {
    return {
      summary: {
        linkedin: 12.5,
        instagram: 14.7,
        facebook: 8.4,
        twitter: 6.9,
      },
    };
  }

  if (lowerPath.includes("/analytics/")) {
    return {
      data: [],
      summary: DEV_OVERALL_METRICS,
    };
  }

  if (options.method === "DELETE") {
    return { success: true };
  }

  return { success: true };
};

export const toApiRole = (displayRole) => {
  const roleMap = {
    Administrator: "Admin",
    "Business User": "Business User",
    "Marketing Team": "Marketing Team",
    "Content Creator": "Content Creator",
  };

  return roleMap[displayRole] || displayRole;
};

export const handleResponse = async (response) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data.message || "Request failed";

    throw new Error(message);
  }

  return data;
};

export const apiRequest = async (path, options = {}) => {
  if (import.meta.env.DEV) {
    const token = getToken();
    const isDevAuth = token && Object.prototype.hasOwnProperty.call(DEV_USERS, token);

    if (isDevAuth) {
      return getDevMockResponse(path, options);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeader(options.body instanceof FormData ? false : true),
      ...options.headers,
    },
  });

  return handleResponse(response);
};
