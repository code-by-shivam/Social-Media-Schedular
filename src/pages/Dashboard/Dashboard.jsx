import {
  Users,
  BarChart3,
  Activity,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getOverallAnalytics,
  getAdminDashboard,
} from "../../services/analyticsService";
import { getCampaigns } from "../../services/campaignService";
import { getPosts } from "../../services/postService";
import { getAccounts } from "../../services/socialService";
import API_BASE_URL, { getToken } from "../../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    campaigns: [],
    posts: [],
    accounts: [],
    overallMetrics: {},
    adminMetrics: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: stores authenticated image URL
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");

        const [
          campaignData,
          postData,
          accountData,
          overallData,
          adminData,
        ] = await Promise.all([
          getCampaigns(),
          getPosts(),
          getAccounts(),
          getOverallAnalytics().catch(() => null),
          user.role === "Administrator"
            ? getAdminDashboard().catch(() => null)
            : Promise.resolve(null),
        ]);

        setDashboardData({
          campaigns: campaignData.campaigns || [],
          posts: postData.posts || [],
          accounts: accountData.accounts || [],
          overallMetrics: overallData?.overall_metrics || {},
          adminMetrics: adminData?.dashboard || {},
        });
      } catch (err) {
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user.role]);

  const {
    campaigns,
    posts,
    accounts,
    overallMetrics,
    adminMetrics,
  } = dashboardData;

  /*
   * Load featured post image with JWT authentication.
   *
   * Normal <img src="..."> requests cannot send our Authorization
   * header, so we fetch the image manually and convert it to a Blob URL.
   */
  useEffect(() => {
    let objectUrl = null;

    const loadFeaturedImage = async () => {
      if (!posts.length) {
        setFeaturedImageUrl("");
        return;
      }

      if (import.meta.env.DEV && posts[0]?.image_url) {
        setFeaturedImageUrl(posts[0].image_url);
        return;
      }

      if (!posts[0]?.has_image) {
        setFeaturedImageUrl("");
        return;
      }

      try {
        const postId = posts[0].post_id;
        const token = getToken();

        if (!token) {
          console.error("No authentication token found.");
          setFeaturedImageUrl("");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/posts/${postId}/image`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Image request failed with status ${response.status}`
          );
        }

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(blob);
        setFeaturedImageUrl(objectUrl);
      } catch (err) {
        console.error("Failed to load featured image:", err);
        setFeaturedImageUrl("");
      }
    };

    loadFeaturedImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [posts]);

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status?.toLowerCase() === "active"
  ).length;

  const scheduledPosts = posts.filter((post) =>
    ["Scheduled", "Queued"].includes(post.status)
  ).length;

  const draftPosts = posts.filter(
    (post) => post.status === "Draft"
  ).length;

  const engagementRate = Number(
    overallMetrics.average_engagement_rate || 0
  );

  const stats = (() => {
    if (user.role === "Administrator") {
      return [
      {
        title: "TOTAL USERS",
        value: String(adminMetrics.total_users || 0),
        change: `${adminMetrics.total_posts || 0} posts in system`,
        icon: <Users size={20} />,
      },
      {
        title: "CONNECTED ACCOUNTS",
        value: String(
          adminMetrics.connected_accounts || accounts.length
        ),
        change: `${adminMetrics.total_campaigns || campaigns.length} campaigns`,
        icon: <Activity size={20} />,
      },
      ];
    }

    if (user.role === "Business User") {
      return [
      {
        title: "CONNECTED ACCOUNTS",
        value: String(accounts.length),
        change: "From connected platforms",
        icon: <Users size={20} />,
      },
      {
        title: "ACTIVE CAMPAIGNS",
        value: String(activeCampaigns),
        change: `${campaigns.length} total campaigns`,
        icon: <BarChart3 size={20} />,
      },
      ];
    }

    if (user.role === "Marketing Team") {
      return [
      {
        title: "CAMPAIGNS",
        value: String(campaigns.length),
        change: `${scheduledPosts} scheduled posts`,
        icon: <BarChart3 size={20} />,
      },
      {
        title: "ENGAGEMENT",
        value: `${engagementRate}%`,
        change: `${overallMetrics.total_engagements || 0} total engagements`,
        icon: <TrendingUp size={20} />,
      },
      ];
    }

    return [
      {
        title: "DRAFT POSTS",
        value: String(draftPosts),
        change: `${posts.length} total posts`,
        icon: <Sparkles size={20} />,
      },
      {
        title: "SCHEDULED POSTS",
        value: String(scheduledPosts),
        change: "From publication queue",
        icon: <BarChart3 size={20} />,
      },
    ];
  })();

  const getAccountPlatform = (accountId) =>
    accounts.find(
      (account) => account.id === accountId
    )?.platform || "Unassigned";

  const formatActivityTime = (value) => {
    if (!value) {
      return {
        time: "--:--",
        date: "NO DATE",
      };
    }

    const date = new Date(value);

    return {
      time: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: date
        .toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })
        .toUpperCase(),
    };
  };

  const recentActivity = posts.slice(0, 5).map((post) => {
    const timestamp = formatActivityTime(
      post.updated_at || post.created_at
    );

    return {
      id: post.post_id,
      ...timestamp,
      platform: getAccountPlatform(post.social_account_id),
      action: post.title || post.caption || "Untitled post",
      author: user.name,
      status: post.status?.toUpperCase() || "UNKNOWN",
    };
  });

  const featuredPost = posts[0];

  const featuredAccount = featuredPost
    ? getAccountPlatform(featuredPost.social_account_id)
    : "No connected platform";

  return (
    <div className="dashboard-page">
      {/* Editorial Header Section */}
      <div className="dash-hero-header hairline-b">
        <div className="dash-header-titles">
          <span className="eyebrow-text font-mono">
            AUTOMATE YOUR POST
          </span>

          <h1 className="dash-title font-serif">
            Welcome, {user.name}
          </h1>

          <p className="dash-subtitle">
            Logged in as <strong>{user.role}</strong>
          </p>
        </div>
      </div>

      {loading && (
        <p className="dashboard-state">
          Loading live dashboard data...
        </p>
      )}

      {error && (
        <p className="dashboard-state dashboard-error">
          {error}
        </p>
      )}

      {/* Top Performing Post Banner */}
      <div className="top-post-banner hairline-b">
        <div className="showcase-img-frame">
          {featuredPost?.has_image && featuredImageUrl ? (
            <img
              src={featuredImageUrl}
              alt={
                featuredPost.title ||
                "Featured post attachment"
              }
              className="showcase-img"
            />
          ) : (
            <div className="showcase-empty-state">
              <FileText size={32} />

              <span>
                {featuredPost
                  ? featuredPost?.has_image
                    ? "Loading image..."
                    : "No attachment"
                  : "Your first post starts here"}
              </span>
            </div>
          )}
        </div>

        <div className="top-post-right">
          <div className="top-post-left">
            <div className="top-post-kicker font-mono">
              <TrendingUp size={14} />
              <span>RECENT POST</span>
            </div>

            <h2 className="top-post-title font-serif">
              {featuredPost?.title ||
                featuredPost?.caption ||
                "Build your publishing rhythm"}
            </h2>

            <p className="top-post-meta font-mono">
              {featuredPost
                ? `${featuredAccount} · ${featuredPost.status}`
                : "READY WHEN YOU ARE"}
            </p>

            <p className="top-post-nudge">
              {featuredPost
                ? "This content is loaded from your latest backend post record."
                : "Create your first post, choose a platform, and start building your content rhythm."}
            </p>
          </div>

          <button
            className="top-post-cta"
            onClick={() => navigate("/scheduler")}
          >
            <span>
              {featuredPost
                ? "Schedule a Follow-up"
                : "Create Your First Post"}
            </span>

            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Open Metrics Strip */}
      <div className="metrics-strip hairline-b">
        {stats.map((item) => (
          <div
            key={item.title}
            className="metric-item"
          >
            <div className="metric-top-row">
              <span className="metric-title font-mono">
                {item.title}
              </span>

              <span className="metric-icon-wrap">
                {item.icon}
              </span>
            </div>

            <div className="metric-value font-serif">
              {item.value}
            </div>

            <div className="metric-change font-mono">
              {item.change}
            </div>
          </div>
        ))}
      </div>

      {/* Full-Width Activity Timeline */}
      <div className="activity-section">
        <div className="section-title-row hairline-b">
          <div className="title-with-icon">
            <Activity size={20} />

            <h2 className="section-heading font-serif">
              Activity Timeline
            </h2>
          </div>

          <span className="section-count font-mono">
            {recentActivity.length} RECENT POSTS
          </span>
        </div>

        <div className="timeline-table-header hairline-b font-mono">
          <span className="col-time">
            TIMESTAMP
          </span>

          <span className="col-action-desc">
            ACTIVITY DESCRIPTION
          </span>

          <span className="col-actor">
            INITIATED BY
          </span>

          <span className="col-status-tag">
            STATUS
          </span>
        </div>

        <div className="activity-flat-list">
          {recentActivity.length === 0 && !loading ? (
            <div className="dashboard-empty-activity">
              <Sparkles size={20} />

              <div>
                <strong>
                  Your activity timeline is waiting for its first post.
                </strong>

                <p>
                  Start with a caption, attach your content,
                  and choose when to publish.
                </p>
              </div>

              <button
                type="button"
                className="activity-create-button"
                onClick={() => navigate("/scheduler")}
              >
                Create Post
              </button>
            </div>
          ) : (
            recentActivity.map((act) => (
              <div
                key={act.id}
                className="activity-full-row hairline-b"
              >
                <div className="col-time font-mono">
                  <span className="time-primary">
                    {act.time}
                  </span>

                  <span className="time-sub">
                    {act.date}
                  </span>
                </div>

                <div className="col-action-desc">
                  <span className="action-text">
                    {act.action}
                  </span>
                </div>

                <div className="col-actor font-mono">
                  <span className="actor-name">
                    {act.author}
                  </span>
                </div>

                <div className="col-status-tag">
                  <span
                    className={`status-pill font-mono ${act.status.toLowerCase()}`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;