import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CampaignTracker.css";

const DEMO_TRACKING_DATA = {
  campaign: {
    campaign_id: 101,
    campaign_name: "Autumn Product Launch",
    platform: "Instagram",
    status: "Active",
    budget: 18000,
  },
  summary: {
    reach: 49200,
    impressions: 68400,
    conversions: 186,
  },
  performance: [
    { performance_id: "demo-101-1", record_date: "2026-09-02", impressions: 8200, clicks: 280, engagement_rate: 10.8, conversions: 21 },
    { performance_id: "demo-101-2", record_date: "2026-09-03", impressions: 9400, clicks: 315, engagement_rate: 11.4, conversions: 25 },
    { performance_id: "demo-101-3", record_date: "2026-09-04", impressions: 10100, clicks: 342, engagement_rate: 12.1, conversions: 28 },
    { performance_id: "demo-101-4", record_date: "2026-09-05", impressions: 11300, clicks: 386, engagement_rate: 13.2, conversions: 34 },
    { performance_id: "demo-101-5", record_date: "2026-09-06", impressions: 9800, clicks: 352, engagement_rate: 12.8, conversions: 31 },
    { performance_id: "demo-101-6", record_date: "2026-09-07", impressions: 9600, clicks: 335, engagement_rate: 11.9, conversions: 27 },
  ],
};

export default function CampaignTracker() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTracking = async () => {
      try {
        setError("");
        setCampaign(DEMO_TRACKING_DATA.campaign);
        setSummary(DEMO_TRACKING_DATA.summary);
        setPerformance(DEMO_TRACKING_DATA.performance);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTracking();
  }, [campaignId]);

  if (loading) {
    return <div className="tracker-page">Loading campaign tracker...</div>;
  }

  if (error) {
    return (
      <div className="tracker-page">
        <p style={{ color: "#dc2626" }}>{error}</p>
        <button className="back-btn" onClick={() => navigate("/campaigns")}>
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="tracker-page">
      <div className="tracker-top-bar">
        <button className="back-btn" onClick={() => navigate("/campaigns")}>
          ← Back to Campaigns
        </button>
      </div>

      <div className="tracker-header">
        <div>
          <span className="section-label">LIVE TRACKER</span>
          <h2>{campaign?.campaign_name}</h2>
          <p>
            Platform: <strong>{campaign?.platform}</strong> • Status:{" "}
            <span className={`status-pill ${campaign?.status?.toLowerCase()}`}>
              {campaign?.status}
            </span>
          </p>
        </div>
      </div>

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
      </div>

      <div className="tracker-table-card">
        <h3>Daily Performance Logs</h3>
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
  );
}
