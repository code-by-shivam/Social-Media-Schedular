import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDraft, getDrafts } from "../../services/postService";
import { getAccounts } from "../../services/socialService";
import "./Drafts.css";

export default function Drafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDrafts = async () => {
    try {
      setError("");
      const [draftData, accountData] = await Promise.all([
        getDrafts(),
        getAccounts(),
      ]);

      setDrafts(draftData.drafts || []);
      setAccounts(accountData.accounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const getPlatformName = (socialAccountId) => {
    const account = accounts.find((item) => item.id === socialAccountId);
    return account?.platform || "Unknown";
  };

  const handleDelete = async (draftId) => {
    const confirmed = window.confirm("Delete this draft?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteDraft(draftId);
      await loadDrafts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="drafts-container">
      <div className="drafts-header">
        <div>
          <p className="eyebrow-text font-mono">CONTENT LIBRARY</p>
          <h2>Drafts</h2>
          <p className="page-subtitle">
            Review saved drafts, fine-tune content, and move them back into the publishing flow.
          </p>
        </div>
        <button className="new-draft-btn" onClick={() => navigate("/scheduler")}>
          + Create Draft
        </button>
      </div>

      {loading && <p>Loading drafts...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <div className="drafts-table-wrapper">
        <table className="drafts-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>PLATFORM</th>
              <th>LAST SAVED</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {drafts.length === 0 && !loading ? (
              <tr>
                <td colSpan="5">No drafts found.</td>
              </tr>
            ) : (
              drafts.map((item) => (
                <tr key={item.post_id}>
                  <td className="draft-title">
                    {item.title || item.caption || "Untitled draft"}
                  </td>
                  <td>
                    <span className="platform-tag">
                      {getPlatformName(item.social_account_id)}
                    </span>
                  </td>
                  <td className="sub-text">
                    {item.updated_at
                      ? new Date(item.updated_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="sub-text">{item.status}</td>
                  <td>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => navigate("/scheduler", { state: { draft: item } })}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(item.post_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
