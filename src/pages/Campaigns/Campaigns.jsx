import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import "./Campaigns.css";

const DEMO_CAMPAIGNS = [
  {
    campaign_id: 101,
    campaign_name: "Autumn Product Launch",
    objective: "Drive qualified product discovery",
    budget: 18000,
    platform: "Instagram",
    start_date: "2026-09-01",
    end_date: "2026-09-30",
    status: "Active",
  },
  {
    campaign_id: 102,
    campaign_name: "Founder Thought Leadership",
    objective: "Build executive audience trust",
    budget: 9500,
    platform: "LinkedIn",
    start_date: "2026-08-18",
    end_date: "2026-09-24",
    status: "Active",
  },
  {
    campaign_id: 103,
    campaign_name: "Weekend Creator Series",
    objective: "Increase community engagement",
    budget: 7200,
    platform: "YouTube",
    start_date: "2026-09-05",
    end_date: "2026-10-05",
    status: "Active",
  },
  {
    campaign_id: 104,
    campaign_name: "Sustainable Studio Stories",
    objective: "Grow brand consideration",
    budget: 12400,
    platform: "Facebook",
    start_date: "2026-07-10",
    end_date: "2026-08-31",
    status: "Completed",
  },
  {
    campaign_id: 105,
    campaign_name: "Holiday Retargeting Sprint",
    objective: "Recover high-intent visitors",
    budget: 15600,
    platform: "X(Twitter)",
    start_date: "2026-10-12",
    end_date: "2026-11-02",
    status: "Paused",
  },
];

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    campaign_name: "",
    objective: "",
    budget: "",
    platform: "Instagram",
    start_date: "",
    end_date: "",
  });

  const loadCampaigns = async () => {
    try {
      setError("");
      setCampaigns(DEMO_CAMPAIGNS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.campaign_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      const newCampaign = {
        campaign_id: Date.now(),
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
        status: "Active",
      };

      setCampaigns((currentCampaigns) => [newCampaign, ...currentCampaigns]);
      setShowForm(false);
      setFormData({
        campaign_name: "",
        objective: "",
        budget: "",
        platform: "Instagram",
        start_date: "",
        end_date: "",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (campaignId) => {
    const confirmed = window.confirm("Delete this campaign?");

    if (!confirmed) {
      return;
    }

    try {
      setCampaigns((currentCampaigns) =>
        currentCampaigns.filter((campaign) => campaign.campaign_id !== campaignId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="campaigns-page">
      <div className="campaigns-header">
        <div>
          <span className="section-label">CAMPAIGN MANAGEMENT</span>
          <h2>Campaigns</h2>
          <p>Create, monitor, and optimize your social media campaigns.</p>
        </div>
        <button className="create-btn" onClick={() => setShowForm(true)}>
          + Create Campaign
        </button>
      </div>

      <div className="campaigns-search-bar">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && <p>Loading campaigns...</p>}
      {error && <p style={{ color: "#9b2c2c" }}>{error}</p>}

      <div className="campaigns-table">
        {filteredCampaigns.length === 0 && !loading ? (
          <p>No campaigns found.</p>
        ) : (
          <>
            <div className="campaign-table-header font-mono">
              <span>CAMPAIGN</span>
              <span>PLATFORM</span>
              <span>CAMPAIGN WINDOW</span>
              <span>STATUS</span>
              <span>BUDGET</span>
              <span>ACTIONS</span>
            </div>
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="campaign-table-row"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/campaigns/analysis/${campaign.campaign_id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/campaigns/analysis/${campaign.campaign_id}`);
                  }
                }}
              >
                <span className="campaign-name-button">{campaign.campaign_name}</span>
                <span className="campaign-platform">{campaign.platform}</span>
                <span className="campaign-dates">
                  {campaign.start_date} to {campaign.end_date}
                </span>
                <span className={`campaign-status ${campaign.status.toLowerCase()}`}>
                  {campaign.status}
                </span>
                <span className="campaign-budget">
                  ${Number(campaign.budget || 0).toLocaleString()}
                </span>
                <div className="campaign-actions">
                  <button
                    type="button"
                    className="table-action-button secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/campaigns/analysis/${campaign.campaign_id}`);
                    }}
                  >
                    Analyze
                  </button>
                  <button
                    type="button"
                    className="table-action-icon danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(campaign.campaign_id);
                    }}
                    aria-label={`Delete ${campaign.campaign_name}`}
                    title="Delete campaign"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "var(--c-dark-80)", display: "grid", placeItems: "center" }}>
          <form
            onSubmit={handleCreate}
            style={{ background: "var(--c-cream)", padding: "24px", borderRadius: "8px", width: "420px", display: "grid", gap: "12px" }}
          >
            <h3>Create Campaign</h3>
            <input
              required
              placeholder="Campaign name"
              value={formData.campaign_name}
              onChange={(event) =>
                setFormData({ ...formData, campaign_name: event.target.value })
              }
            />
            <input
              placeholder="Objective"
              value={formData.objective}
              onChange={(event) =>
                setFormData({ ...formData, objective: event.target.value })
              }
            />
            <input
              type="number"
              placeholder="Budget"
              value={formData.budget}
              onChange={(event) =>
                setFormData({ ...formData, budget: event.target.value })
              }
            />
            <select
              value={formData.platform}
              onChange={(event) =>
                setFormData({ ...formData, platform: event.target.value })
              }
            >
              <option>Instagram</option>
              <option>Facebook</option>
              <option>LinkedIn</option>
              <option>X(Twitter)</option>
              <option>YouTube</option>
              <option>Pinterest</option>
            </select>
            <input
              required
              type="date"
              value={formData.start_date}
              onChange={(event) =>
                setFormData({ ...formData, start_date: event.target.value })
              }
            />
            <input
              required
              type="date"
              value={formData.end_date}
              onChange={(event) =>
                setFormData({ ...formData, end_date: event.target.value })
              }
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="create-btn">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
