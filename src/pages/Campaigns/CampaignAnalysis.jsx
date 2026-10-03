import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";
import "./CampaignAnalysis.css";

const DEMO_CAMPAIGNS = [
  { campaign_id: "101", campaign_name: "Autumn Product Launch", platform: "Instagram", status: "Active", budget: 18000, objective: "Drive qualified product discovery", start_date: "2026-09-01", end_date: "2026-09-30" },
  { campaign_id: "102", campaign_name: "Founder Thought Leadership", platform: "LinkedIn", status: "Active", budget: 9500, objective: "Build executive audience trust", start_date: "2026-08-18", end_date: "2026-09-24" },
  { campaign_id: "103", campaign_name: "Weekend Creator Series", platform: "YouTube", status: "Active", budget: 7200, objective: "Increase community engagement", start_date: "2026-09-05", end_date: "2026-10-05" },
  { campaign_id: "104", campaign_name: "Sustainable Studio Stories", platform: "Facebook", status: "Completed", budget: 12400, objective: "Grow brand consideration", start_date: "2026-07-10", end_date: "2026-08-31" },
];

const DEMO_CAMPAIGN_SUMMARY = {
  reach: 49200,
  impressions: 68400,
  clicks: 2180,
  conversions: 186,
};

const DEMO_PERFORMANCE = [
  { performance_id: "demo-analysis-1", record_date: "2026-09-02", impressions: 8200, clicks: 280, engagement_rate: 10.8, conversions: 21 },
  { performance_id: "demo-analysis-2", record_date: "2026-09-03", impressions: 9400, clicks: 315, engagement_rate: 11.4, conversions: 25 },
  { performance_id: "demo-analysis-3", record_date: "2026-09-04", impressions: 10100, clicks: 342, engagement_rate: 12.1, conversions: 28 },
  { performance_id: "demo-analysis-4", record_date: "2026-09-05", impressions: 11300, clicks: 386, engagement_rate: 13.2, conversions: 34 },
  { performance_id: "demo-analysis-5", record_date: "2026-09-06", impressions: 9800, clicks: 352, engagement_rate: 12.8, conversions: 31 },
];

const DEMO_COMPARISON_METRICS = {
  "101": { impressions: 68400, engagements: 8420, clicks: 2180, conversions: 186 },
  "102": { impressions: 42700, engagements: 6190, clicks: 1430, conversions: 124 },
  "103": { impressions: 35600, engagements: 4870, clicks: 980, conversions: 92 },
  "104": { impressions: 29100, engagements: 3650, clicks: 740, conversions: 61 },
};

export default function CampaignAnalysis() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tracking");
  const [campaign, setCampaign] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [comparisonFilterOpen, setComparisonFilterOpen] = useState(false);
  const [roiData, setRoiData] = useState({
    revenue: "",
    conversions: "",
    costPerConversion: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");
        const selectedCampaign = DEMO_CAMPAIGNS.find(
          (item) => item.campaign_id === String(campaignId)
        ) || DEMO_CAMPAIGNS[0];

        setCampaign(selectedCampaign);
        setAllCampaigns(DEMO_CAMPAIGNS);
        setSummary(DEMO_CAMPAIGN_SUMMARY);
        setPerformance(DEMO_PERFORMANCE);
        setRoiData({ revenue: "23150", conversions: "186", costPerConversion: "96.77" });
        
        // Pre-select current campaign for comparison
        setSelectedCampaigns([campaignId]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [campaignId]);

  const calculateROI = () => {
    if (!campaign || !roiData.revenue) return 0;
    
    const budget = campaign.budget || 0;
    const revenue = parseFloat(roiData.revenue) || 0;
    const roi = ((revenue - budget) / budget) * 100;
    return roi.toFixed(2);
  };

  const calculateROIPerConversion = () => {
    if (!roiData.conversions || !roiData.revenue) return 0;
    
    const conversions = parseFloat(roiData.conversions) || 0;
    const revenue = parseFloat(roiData.revenue) || 0;
    return conversions > 0 ? (revenue / conversions).toFixed(2) : 0;
  };

  const handleCampaignSelection = (campaignId) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const selectedComparisonData = allCampaigns
    .filter((item) => selectedCampaigns.includes(item.campaign_id))
    .map((item) => ({
      name: item.campaign_name,
      ...DEMO_COMPARISON_METRICS[item.campaign_id],
    }));

  if (loading) {
    return <div className="analysis-page">Loading campaign analysis...</div>;
  }

  if (error) {
    return (
      <div className="analysis-page">
        <p style={{ color: "#dc2626" }}>{error}</p>
        <button className="back-btn" onClick={() => navigate("/campaigns")}>
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <div>
          <span className="section-label">CAMPAIGN ANALYSIS</span>
          <h2>{campaign?.campaign_name}</h2>
          <p>
            Platform: <strong>{campaign?.platform}</strong> • Status:{" "}
            <span className={`status-pill ${campaign?.status?.toLowerCase()}`}>
              {campaign?.status}
            </span>
          </p>
        </div>
        <button className="back-btn" onClick={() => navigate("/campaigns")}>
          ← Back to Campaigns
        </button>
      </div>

      <div className="analysis-tabs">
        <button
          className={`tab-btn ${activeTab === "tracking" ? "active" : ""}`}
          onClick={() => setActiveTab("tracking")}
        >
          Tracking Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === "compare" ? "active" : ""}`}
          onClick={() => setActiveTab("compare")}
        >
          Compare Campaigns
        </button>
        <button
          className={`tab-btn ${activeTab === "separate" ? "active" : ""}`}
          onClick={() => setActiveTab("separate")}
        >
          Separate Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === "roi" ? "active" : ""}`}
          onClick={() => setActiveTab("roi")}
        >
          ROI Calculator
        </button>
      </div>

      <div className={`analysis-content ${activeTab === "tracking" || activeTab === "compare" ? "tracking-analysis-content" : ""}`}>
        {activeTab === "tracking" && (
          <div className="tab-content tracking-tab">
            <h3>Tracking Analysis</h3>
            <div className="tracker-stats-grid">
              <div className="stat-card">
                <p className="stat-label">Budget Allocated</p>
                <span className="stat-value">${campaign?.budget || 0}</span>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Reach</p>
                <span className="stat-value">{summary?.reach || 0}</span>
              </div>
              <div className="stat-card">
                <p className="stat-label">Impressions</p>
                <span className="stat-value">{summary?.impressions || 0}</span>
              </div>
              <div className="stat-card">
                <p className="stat-label">Conversions</p>
                <span className="stat-value">{summary?.conversions || 0}</span>
              </div>
              <div className="stat-card">
                <p className="stat-label">Click-Through Rate</p>
                <span className="stat-value">
                  {summary?.clicks && summary?.impressions 
                    ? ((summary.clicks / summary.impressions) * 100).toFixed(2) 
                    : 0}%
                </span>
              </div>
              <div className="stat-card">
                <p className="stat-label">Engagement Rate</p>
                <span className="stat-value">
                  {performance.length > 0 
                    ? (performance.reduce((acc, p) => acc + (p.engagement_rate || 0), 0) / performance.length).toFixed(2) 
                    : 0}%
                </span>
              </div>
            </div>

            <div className="tracker-table-card">
              <h3>Daily Performance Logs</h3>
              <div className="analysis-chart-grid">
                <div className="analysis-chart-panel">
                  <h4>Daily Reach Trend</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d8cdbd" />
                      <XAxis dataKey="record_date" stroke="#58554e" fontSize={11} />
                      <YAxis stroke="#58554e" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="impressions" stroke="#27251f" strokeWidth={2.5} name="Impressions" />
                      <Line type="monotone" dataKey="clicks" stroke="#8f8171" strokeWidth={2.5} name="Clicks" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="analysis-chart-panel">
                  <h4>Daily Conversions</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d8cdbd" />
                      <XAxis dataKey="record_date" stroke="#58554e" fontSize={11} />
                      <YAxis stroke="#58554e" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="conversions" fill="#58554e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <table className="tracker-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>Engagement Rate</th>
                    <th>Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.length === 0 ? (
                    <tr>
                      <td colSpan="5">No performance records yet.</td>
                    </tr>
                  ) : (
                    performance.map((item) => (
                      <tr key={item.performance_id}>
                        <td>{item.record_date}</td>
                        <td>{item.impressions || 0}</td>
                        <td>{item.clicks || 0}</td>
                        <td>{item.engagement_rate || 0}%</td>
                        <td>{item.conversions || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "compare" && (
          <div className="tab-content compare-tab">
            <h3>Compare Campaigns</h3>
            <p className="tab-description">Select campaigns to compare their performance metrics</p>
            
            <div className="campaign-selection">
              <div className="comparison-filter-dropdown">
                <button
                  type="button"
                  className="comparison-filter-trigger"
                  onClick={() => setComparisonFilterOpen((isOpen) => !isOpen)}
                  aria-expanded={comparisonFilterOpen}
                >
                  <span>Compare campaigns</span>
                  <span className="comparison-filter-count">
                    {selectedCampaigns.length}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {comparisonFilterOpen && (
                  <div className="comparison-filter-menu">
                    {allCampaigns.map((cmp) => (
                      <label key={cmp.campaign_id} className="comparison-filter-option">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(cmp.campaign_id)}
                          onChange={() => handleCampaignSelection(cmp.campaign_id)}
                        />
                        <span>{cmp.campaign_name}</span>
                        <small>{cmp.platform}</small>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="comparison-selected-chips" aria-live="polite">
                {allCampaigns
                  .filter((cmp) => selectedCampaigns.includes(cmp.campaign_id))
                  .map((cmp) => (
                    <span key={cmp.campaign_id} className="comparison-selected-chip">
                      {cmp.campaign_name}
                    </span>
                  ))}
              </div>
            </div>

            {selectedCampaigns.length > 0 && (
              <div className="comparison-table-card">
                <h4>Performance Comparison</h4>
                <div className="analysis-chart-grid comparison-charts">
                  <div className="analysis-chart-panel">
                    <h4>Campaign Reach &amp; Engagement</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={selectedComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d8cdbd" />
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="#58554e" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="impressions" fill="#27251f" name="Impressions" />
                        <Bar dataKey="engagements" fill="#8f8171" name="Engagements" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="analysis-chart-panel">
                    <h4>Clicks &amp; Conversions</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={selectedComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d8cdbd" />
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="#58554e" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="clicks" fill="#58554e" name="Clicks" />
                        <Bar dataKey="conversions" fill="#b6a58f" name="Conversions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Platform</th>
                      <th>Budget</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCampaigns
                      .filter(cmp => selectedCampaigns.includes(cmp.campaign_id))
                      .map((cmp) => (
                        <tr key={cmp.campaign_id}>
                          <td>{cmp.campaign_name}</td>
                          <td>{cmp.platform}</td>
                          <td>${cmp.budget || 0}</td>
                          <td>
                            <span className={`status-pill ${cmp.status?.toLowerCase()}`}>
                              {cmp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "separate" && (
          <div className="tab-content separate-tab">
            <h3>Separate Analysis</h3>
            <p className="tab-description">Deep dive into this campaign's individual performance</p>
            
            <div className="separate-analysis-grid">
              <div className="analysis-card">
                <h4>Campaign Overview</h4>
                <div className="analysis-details">
                  <div className="detail-row">
                    <span className="detail-label">Campaign Name:</span>
                    <span className="detail-value">{campaign?.campaign_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Platform:</span>
                    <span className="detail-value">{campaign?.platform}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Objective:</span>
                    <span className="detail-value">{campaign?.objective || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-pill ${campaign?.status?.toLowerCase()}`}>
                      {campaign?.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">
                      {campaign?.start_date} to {campaign?.end_date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="analysis-card">
                <h4>Performance Metrics</h4>
                <div className="metrics-chart">
                  <div className="metric-bar">
                    <span className="metric-label">Reach</span>
                    <div className="metric-bar-bg">
                      <div 
                        className="metric-bar-fill" 
                        style={{ width: `${Math.min((summary?.reach || 0) / 10000 * 100, 100)}%` }}
                      >
                        {summary?.reach || 0}
                      </div>
                    </div>
                  </div>
                  <div className="metric-bar">
                    <span className="metric-label">Impressions</span>
                    <div className="metric-bar-bg">
                      <div 
                        className="metric-bar-fill" 
                        style={{ width: `${Math.min((summary?.impressions || 0) / 10000 * 100, 100)}%` }}
                      >
                        {summary?.impressions || 0}
                      </div>
                    </div>
                  </div>
                  <div className="metric-bar">
                    <span className="metric-label">Conversions</span>
                    <div className="metric-bar-bg">
                      <div 
                        className="metric-bar-fill" 
                        style={{ width: `${Math.min((summary?.conversions || 0) / 1000 * 100, 100)}%` }}
                      >
                        {summary?.conversions || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analysis-card">
                <h4>Performance Timeline</h4>
                <div className="timeline-chart">
                  {performance.length > 0 ? (
                    performance.map((item) => (
                      <div key={item.performance_id} className="timeline-item">
                        <span className="timeline-date">{item.record_date}</span>
                        <div className="timeline-metrics">
                          <span className="timeline-metric">
                            Impressions: {item.impressions || 0}
                          </span>
                          <span className="timeline-metric">
                            Clicks: {item.clicks || 0}
                          </span>
                          <span className="timeline-metric">
                            Conversions: {item.conversions || 0}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No performance data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "roi" && (
          <div className="tab-content roi-tab">
            <h3>ROI Calculator</h3>
            <p className="tab-description">Calculate Return on Investment for this campaign</p>
            
            <div className="roi-calculator">
              <div className="roi-investment-section">
                <h4>Campaign Investment</h4>
                <div className="roi-display">
                  <span className="roi-label">Total Budget:</span>
                  <span className="roi-value">${campaign?.budget || 0}</span>
                </div>
              </div>

              <div className="roi-input-section">
                <h4>Revenue & Conversions</h4>
                <div className="roi-form">
                  <div className="form-group">
                    <label>Total Revenue Generated ($)</label>
                    <input
                      type="number"
                      value={roiData.revenue}
                      onChange={(e) => setRoiData({ ...roiData, revenue: e.target.value })}
                      placeholder="Enter total revenue"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Conversions</label>
                    <input
                      type="number"
                      value={roiData.conversions}
                      onChange={(e) => setRoiData({ ...roiData, conversions: e.target.value })}
                      placeholder="Enter total conversions"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cost Per Conversion ($)</label>
                    <input
                      type="number"
                      value={roiData.costPerConversion}
                      onChange={(e) => setRoiData({ ...roiData, costPerConversion: e.target.value })}
                      placeholder="Auto-calculated or enter manually"
                    />
                  </div>
                </div>
              </div>

              <div className="roi-results-section">
                <h4>ROI Results</h4>
                <div className="roi-metrics">
                  <div className="roi-metric">
                    <span className="roi-metric-label">Return on Investment:</span>
                    <span className={`roi-metric-value ${calculateROI() >= 0 ? 'positive' : 'negative'}`}>
                      {calculateROI()}%
                    </span>
                  </div>
                  <div className="roi-metric">
                    <span className="roi-metric-label">Net Profit/Loss:</span>
                    <span className={`roi-metric-value ${(parseFloat(roiData.revenue) - (campaign?.budget || 0)) >= 0 ? 'positive' : 'negative'}`}>
                      ${(parseFloat(roiData.revenue) - (campaign?.budget || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="roi-metric">
                    <span className="roi-metric-label">Revenue Per Conversion:</span>
                    <span className="roi-metric-value">
                      ${calculateROIPerConversion()}
                    </span>
                  </div>
                  <div className="roi-metric">
                    <span className="roi-metric-label">Total Cost Per Conversion:</span>
                    <span className="roi-metric-value">
                      ${roiData.costPerConversion || ((campaign?.budget || 0) / (parseFloat(roiData.conversions) || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}