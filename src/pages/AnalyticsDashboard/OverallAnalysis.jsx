import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronDown } from "lucide-react";
import {
  getOverallAnalytics,
  getCampaignEngagement,
  getCampaignPerformance,
  getAudienceGrowth,
} from "../../services/analyticsService";
import { getCampaigns } from "../../services/campaignService";
import { getSocialAccounts } from "../../services/socialService";
import "./OverallAnalysis.css";

const COLORS = ["#27251f", "#58554e", "#8f8171", "#b6a58f", "#d1c2ad"];
const DARK_MODE_COLORS = ["#f5efe7", "#d6c5ad", "#c7ad8d", "#a98d6e", "#d8c1a2"];
const USE_DEMO_DATA = true;

const isDarkChartTheme = () => {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.theme === "dark";
};

const getDemoAnalyticsData = () => {
  const campaigns = [
    {
      campaign_id: 101,
      campaign_name: "Autumn Product Launch",
      platform: "Instagram",
      status: "Active",
      budget: 18000,
      engagement: { total_engagements: 8420, impressions: 68400, average_engagement_rate: 12.3, clicks: 2180, conversions: 186, reach: 49200 },
    },
    {
      campaign_id: 102,
      campaign_name: "Founder Thought Leadership",
      platform: "LinkedIn",
      status: "Active",
      budget: 9500,
      engagement: { total_engagements: 6190, impressions: 42700, average_engagement_rate: 9.8, clicks: 1430, conversions: 124, reach: 31800 },
    },
    {
      campaign_id: 103,
      campaign_name: "Weekend Creator Series",
      platform: "YouTube",
      status: "Active",
      budget: 7200,
      engagement: { total_engagements: 4870, impressions: 35600, average_engagement_rate: 8.6, clicks: 980, conversions: 92, reach: 26400 },
    },
    {
      campaign_id: 104,
      campaign_name: "Sustainable Studio Stories",
      platform: "Facebook",
      status: "Completed",
      budget: 12400,
      engagement: { total_engagements: 3650, impressions: 29100, average_engagement_rate: 7.4, clicks: 740, conversions: 61, reach: 21300 },
    },
  ];

  const performanceData = [
    { day: "Mon", impressions: 12400, engagement: 1820, clicks: 420, conversions: 28 },
    { day: "Tue", impressions: 15800, engagement: 2240, clicks: 510, conversions: 36 },
    { day: "Wed", impressions: 13200, engagement: 1970, clicks: 460, conversions: 31 },
    { day: "Thu", impressions: 18900, engagement: 2890, clicks: 680, conversions: 48 },
    { day: "Fri", impressions: 22400, engagement: 3150, clicks: 740, conversions: 55 },
    { day: "Sat", impressions: 17600, engagement: 2460, clicks: 580, conversions: 42 },
    { day: "Sun", impressions: 20500, engagement: 2820, clicks: 630, conversions: 49 },
  ];

  return {
    campaigns,
    campaignsData: campaigns,
    overallMetrics: {
      totalImpressions: 175800,
      totalEngagements: 23130,
      totalClicks: 5330,
      totalConversions: 463,
      totalReach: 128700,
      averageEngagementRate: 9.53,
      totalBudget: 47100,
      totalRevenue: 23150,
      averageROI:  -50.85,
    },
    performanceData,
    platformDistribution: [
      { name: "Instagram", value: 1 },
      { name: "LinkedIn", value: 1 },
      { name: "YouTube", value: 1 },
      { name: "Facebook", value: 1 },
    ],
    audienceGrowth: [],
  };
};

export default function OverallAnalysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [metric, setMetric] = useState("impressions");
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [campaignFilterOpen, setCampaignFilterOpen] = useState(false);
  
  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsData, setCampaignsData] = useState([]);
  const [overallMetrics, setOverallMetrics] = useState({
    totalImpressions: 0,
    totalEngagements: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalReach: 0,
    averageEngagementRate: 0,
    totalBudget: 0,
    totalRevenue: 0,
    averageROI: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [platformDistribution, setPlatformDistribution] = useState([]);
  const [topPerformingCampaigns, setTopPerformingCampaigns] = useState([]);
  const [audienceGrowth, setAudienceGrowth] = useState([]);

  const loadOverallAnalysis = async () => {
    try {
      setError("");
      setLoading(true);

      if (USE_DEMO_DATA) {
        const demoData = getDemoAnalyticsData();
        setCampaigns(demoData.campaigns);
        setSelectedCampaigns(demoData.campaigns.map((campaign) => campaign.campaign_id));
        setCampaignsData(demoData.campaignsData);
        setOverallMetrics(demoData.overallMetrics);
        setPerformanceData(demoData.performanceData);
        setPlatformDistribution(demoData.platformDistribution);
        setTopPerformingCampaigns(demoData.campaignsData);
        setAudienceGrowth(demoData.audienceGrowth);
        return;
      }

      // Use the new backend overall analytics endpoint
      const overallData = await getOverallAnalytics(timeRange);

      // Fetch all user campaigns
      const campaignsResponse = await getCampaigns();
      const userCampaigns = campaignsResponse.campaigns || [];
      setCampaigns(userCampaigns);
      setSelectedCampaigns(userCampaigns.map(c => c.campaign_id));

      // Fetch detailed data for each campaign
      const campaignsDetailedData = await Promise.all(
        userCampaigns.map(async (campaign) => {
          try {
            const [engagementData, performanceData] = await Promise.all([
              getCampaignEngagement(campaign.campaign_id),
              getCampaignPerformance(campaign.campaign_id),
            ]);

            return {
              ...campaign,
              engagement: engagementData.engagement || {},
              performance: performanceData.performance || [],
            };
          } catch (err) {
            console.error(`Error fetching data for campaign ${campaign.campaign_id}:`, err);
            return {
              ...campaign,
              engagement: {},
              performance: [],
            };
          }
        })
      );

      setCampaignsData(campaignsDetailedData);

      // Use backend calculated metrics if available, otherwise calculate locally
      if (overallData && overallData.overall_metrics) {
        const totalBudget = overallData.overall_metrics.total_budget || 0;
        const totalConversions = overallData.overall_metrics.total_conversions || 0;
        const totalRevenue = totalConversions * 50; // Assuming $50 per conversion
        const averageROI = totalBudget > 0
          ? ((totalRevenue - totalBudget) / totalBudget * 100).toFixed(2)
          : 0;

        setOverallMetrics({
          totalImpressions: overallData.overall_metrics.total_impressions || 0,
          totalEngagements: overallData.overall_metrics.total_engagements || 0,
          totalClicks: overallData.overall_metrics.total_clicks || 0,
          totalConversions: totalConversions,
          totalReach: overallData.overall_metrics.total_reach || 0,
          averageEngagementRate: overallData.overall_metrics.average_engagement_rate || 0,
          totalBudget: totalBudget,
          totalRevenue: totalRevenue,
          averageROI: averageROI,
        });
      } else {
        // Fallback to local calculation
        calculateOverallMetrics(campaignsDetailedData);
      }

      // Process performance data for charts
      processPerformanceData(campaignsDetailedData);

      // Calculate platform distribution
      calculatePlatformDistribution(userCampaigns);

      // Identify top performing campaigns
      identifyTopCampaigns(campaignsDetailedData);

      // Fetch audience growth if social accounts exist
      try {
        const socialAccounts = await getSocialAccounts();
        if (socialAccounts.length > 0) {
          const growthData = await getAudienceGrowth(socialAccounts[0].social_account_id);
          setAudienceGrowth(growthData.audience_growth || []);
        }
      } catch (err) {
        console.error("Error fetching audience growth:", err);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverallAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, metric]);


  const calculateOverallMetrics = (campaignsData) => {
    const metrics = {
      totalImpressions: 0,
      totalEngagements: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalReach: 0,
      averageEngagementRate: 0,
      totalBudget: 0,
      totalRevenue: 0,
      averageROI: 0,
    };

    let totalEngagementRate = 0;
    let campaignsWithRate = 0;

    campaignsData.forEach((campaign) => {
      const engagement = campaign.engagement || {};
      
      metrics.totalImpressions += engagement.impressions || 0;
      metrics.totalEngagements += engagement.total_engagements || 0;
      metrics.totalClicks += engagement.clicks || 0;
      metrics.totalReach += engagement.reach || 0;
      metrics.totalConversions += engagement.conversions || 0;
      metrics.totalBudget += campaign.budget || 0;

      if (engagement.average_engagement_rate) {
        totalEngagementRate += engagement.average_engagement_rate;
        campaignsWithRate++;
      }
    });

    metrics.averageEngagementRate = campaignsWithRate > 0 
      ? (totalEngagementRate / campaignsWithRate).toFixed(2) 
      : 0;

    // Calculate ROI (simplified - in real scenario would come from ROI endpoint)
    metrics.totalRevenue = metrics.totalConversions * 50; // Assuming $50 per conversion
    metrics.averageROI = metrics.totalBudget > 0 
      ? ((metrics.totalRevenue - metrics.totalBudget) / metrics.totalBudget * 100).toFixed(2) 
      : 0;

    setOverallMetrics(metrics);
  };

  const processPerformanceData = (campaignsData) => {
    // Aggregate performance data by date across all campaigns
    const dateMap = new Map();

    campaignsData.forEach((campaign) => {
      const performance = campaign.performance || [];
      
      performance.forEach((record) => {
        const date = record.record_date;
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            date,
            impressions: 0,
            engagement: 0,
            clicks: 0,
            conversions: 0,
          });
        }

        const dayData = dateMap.get(date);
        dayData.impressions += record.impressions || 0;
        dayData.engagement += (record.likes || 0) + (record.comments || 0) + (record.shares || 0);
        dayData.clicks += record.clicks || 0;
        dayData.conversions += record.conversions || 0;
      });
    });

    // Convert to array and sort by date
    const sortedData = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7) // Last 7 days
      .map(item => ({
        day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        ...item
      }));

    setPerformanceData(sortedData);
  };

  const calculatePlatformDistribution = (campaigns) => {
    const platformMap = new Map();

    campaigns.forEach((campaign) => {
      const platform = campaign.platform;
      platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
    });

    const distribution = Array.from(platformMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    setPlatformDistribution(distribution);
  };

  const identifyTopCampaigns = (campaignsData) => {
    const sorted = [...campaignsData].sort((a, b) => {
      const engagementA = a.engagement?.total_engagements || 0;
      const engagementB = b.engagement?.total_engagements || 0;
      return engagementB - engagementA;
    });

    setTopPerformingCampaigns(sorted.slice(0, 5));
  };

  const getMetricTitle = () => {
    switch (metric) {
      case "engagement":
        return "Engagement";
      case "clicks":
        return "Link Clicks";
      case "conversions":
        return "Conversions";
      case "impressions":
      default:
        return "Impressions";
    }
  };

  const handleCampaignToggle = (campaignId) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const visibleTopPerformingCampaigns = topPerformingCampaigns.filter((campaign) =>
    selectedCampaigns.includes(campaign.campaign_id)
  ).sort(
    (firstCampaign, secondCampaign) =>
      (secondCampaign.engagement?.total_engagements || 0) -
      (firstCampaign.engagement?.total_engagements || 0)
  );

  const selectedCampaignData = campaignsData.filter((campaign) =>
    selectedCampaigns.includes(campaign.campaign_id)
  );
  const selectedMetrics = selectedCampaignData.reduce(
    (metrics, campaign) => {
      const engagement = campaign.engagement || {};
      metrics.totalImpressions += engagement.impressions || 0;
      metrics.totalEngagements += engagement.total_engagements || 0;
      metrics.totalClicks += engagement.clicks || 0;
      metrics.totalConversions += engagement.conversions || 0;
      metrics.totalReach += engagement.reach || 0;
      metrics.totalBudget += Number(campaign.budget || 0);
      return metrics;
    },
    {
      totalImpressions: 0,
      totalEngagements: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalReach: 0,
      totalBudget: 0,
    }
  );
  const selectedRevenue = selectedMetrics.totalConversions * 50;
  const selectedROI = selectedMetrics.totalBudget > 0
    ? ((selectedRevenue - selectedMetrics.totalBudget) / selectedMetrics.totalBudget * 100).toFixed(2)
    : "0.00";
  const selectedEngagementTotal = selectedCampaignData.reduce(
    (total, campaign) => total + (campaign.engagement?.total_engagements || 0),
    0
  );
  const darkChartPalette = isDarkChartTheme() ? DARK_MODE_COLORS : COLORS;
  const selectedChartData = performanceData.map((point) => {
    const chartPoint = { day: point.day };

    selectedCampaignData.forEach((campaign) => {
      const campaignWeight = selectedEngagementTotal
        ? (campaign.engagement?.total_engagements || 0) / selectedEngagementTotal
        : 0;
      chartPoint[`campaign_${campaign.campaign_id}`] = Math.round(
        (point[metric] || 0) * campaignWeight
      );
    });

    return chartPoint;
  });
  const selectedPlatformDistribution = selectedCampaignData.reduce((distribution, campaign) => {
    const existingPlatform = distribution.find((item) => item.name === campaign.platform);

    if (existingPlatform) {
      existingPlatform.value += 1;
    } else {
      distribution.push({ name: campaign.platform, value: 1 });
    }

    return distribution;
  }, []);

  if (loading) {
    return (
      <div className="overall-analysis-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overall-analysis-page">
        <div className="error-container">
          <p style={{ color: "#9b2c2c" }}>{error}</p>
          <button className="retry-btn" onClick={loadOverallAnalysis}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overall-analysis-page">
      {/* Header */}
      <div className="analysis-header">
        <div>
          <span className="section-label">OVERALL ANALYTICS</span>
          <h2>Your Performance Dashboard</h2>
          <p>Comprehensive analysis across all your campaigns and platforms</p>
        </div>
        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="metric-select"
          >
            <option value="impressions">Impressions</option>
            <option value="engagement">Engagement</option>
            <option value="clicks">Clicks</option>
            <option value="conversions">Conversions</option>
          </select>
        </div>
      </div>

      <div className="campaign-filter-toolbar">
        <div className="campaign-filter-dropdown">
          <button
            type="button"
            className="campaign-filter-trigger"
            onClick={() => setCampaignFilterOpen((isOpen) => !isOpen)}
            aria-expanded={campaignFilterOpen}
          >
            <span>Filter campaigns</span>
            <span className="campaign-filter-count">{selectedCampaigns.length} selected</span>
            <ChevronDown size={16} />
          </button>
          {campaignFilterOpen && (
            <div className="campaign-filter-menu">
              {campaigns.map((campaign) => (
                <label key={campaign.campaign_id} className="campaign-filter-option">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign.campaign_id)}
                    onChange={() => handleCampaignToggle(campaign.campaign_id)}
                  />
                  <span>{campaign.campaign_name}</span>
                  <small>{campaign.platform}</small>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="selected-campaign-chips" aria-live="polite">
          {selectedCampaignData.map((campaign) => (
            <span key={campaign.campaign_id} className="selected-campaign-chip">
              {campaign.campaign_name}
            </span>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon impressions-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Impressions</p>
            <h3 className="kpi-value">{selectedMetrics.totalImpressions.toLocaleString()}</h3>
            <p className="kpi-change positive">+12.5%</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon engagement-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Engagements</p>
            <h3 className="kpi-value">{selectedMetrics.totalEngagements.toLocaleString()}</h3>
            <p className="kpi-change positive">+8.2%</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon clicks-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Clicks</p>
            <h3 className="kpi-value">{selectedMetrics.totalClicks.toLocaleString()}</h3>
            <p className="kpi-change positive">+15.1%</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon conversions-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Conversions</p>
            <h3 className="kpi-value">{selectedMetrics.totalConversions.toLocaleString()}</h3>
            <p className="kpi-change positive">+5.4%</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon roi-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Average ROI</p>
            <h3 className="kpi-value">{selectedROI}%</h3>
            <p className={`kpi-change ${parseFloat(selectedROI) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(selectedROI) >= 0 ? '+' : ''}{selectedROI}%
            </p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon budget-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Budget</p>
            <h3 className="kpi-value">${selectedMetrics.totalBudget.toLocaleString()}</h3>
            <p className="kpi-change neutral">Active</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card main-chart">
          <div className="chart-header">
            <h3>Daily {getMetricTitle()} Trend</h3>
            <p className="chart-subtitle">Performance over selected time period</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkChartTheme() ? "rgba(245,239,231,0.28)" : "#d8cdbd"} />
                <XAxis dataKey="day" stroke={isDarkChartTheme() ? "#f5efe7" : "#58554e"} fontSize={12} tickLine={false} />
                <YAxis stroke={isDarkChartTheme() ? "#f5efe7" : "#58554e"} fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkChartTheme() ? '#111111' : '#f7f0e5',
                    borderColor: isDarkChartTheme() ? 'rgba(245,239,231,0.2)' : '#d8cdbd',
                    color: isDarkChartTheme() ? '#f5efe7' : '#27251f',
                    fontSize: '12px', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                {selectedCampaignData.map((campaign, index) => (
                  <Line
                    key={campaign.campaign_id}
                    type="monotone"
                    dataKey={`campaign_${campaign.campaign_id}`}
                    name={campaign.campaign_name}
                    stroke={darkChartPalette[index % darkChartPalette.length]}
                    strokeWidth={3}
                    dot={{ fill: darkChartPalette[index % darkChartPalette.length], r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card secondary-chart">
          <div className="chart-header">
            <h3>Platform Distribution</h3>
            <p className="chart-subtitle">Campaigns by platform</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={selectedPlatformDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {selectedPlatformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={darkChartPalette[index % darkChartPalette.length]} stroke={isDarkChartTheme() ? "#f5efe7" : "#ffffff"} strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkChartTheme() ? '#111111' : '#f7f0e5',
                    borderColor: isDarkChartTheme() ? 'rgba(245,239,231,0.2)' : '#d8cdbd',
                    color: isDarkChartTheme() ? '#f5efe7' : '#27251f',
                    fontSize: '12px', 
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            {selectedPlatformDistribution.map((item, index) => (
              <div key={item.name} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: darkChartPalette[index % darkChartPalette.length] }}
                ></div>
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Campaigns Section */}
      <div className="top-campaigns-section">
        <div className="section-header">
          <h3>Top Performing Campaigns</h3>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/campaigns')}
          >
            View All Campaigns
          </button>
        </div>
        <div className="campaign-ranking-table">
          <div className="campaign-ranking-header font-mono">
            <span>RANK</span>
            <span>CAMPAIGN</span>
            <span>PLATFORM / STATUS</span>
            <span>ENGAGEMENTS</span>
            <span>IMPRESSIONS</span>
            <span>ENG. RATE</span>
            <span>BUDGET</span>
          </div>
          {visibleTopPerformingCampaigns.map((campaign, index) => (
            <button
              type="button"
              key={campaign.campaign_id}
              className="campaign-ranking-row"
              onClick={() => navigate(`/campaigns/analysis/${campaign.campaign_id}`)}
            >
              <span className="campaign-rank">{String(index + 1).padStart(2, "0")}</span>
              <span className="campaign-ranking-name">{campaign.campaign_name}</span>
              <span className="campaign-ranking-platform">
                <strong>{campaign.platform}</strong>
                <small className={`campaign-status ${campaign.status?.toLowerCase()}`}>
                  {campaign.status}
                </small>
              </span>
              <span className="campaign-ranking-value">
                {(campaign.engagement?.total_engagements || 0).toLocaleString()}
              </span>
              <span className="campaign-ranking-value">
                {(campaign.engagement?.impressions || 0).toLocaleString()}
              </span>
              <span className="campaign-ranking-value">
                {campaign.engagement?.average_engagement_rate || 0}%
              </span>
              <span className="campaign-ranking-value">
                ${Number(campaign.budget || 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}