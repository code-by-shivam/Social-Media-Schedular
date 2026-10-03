import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "../../services/postService";
import { cancelQueueItem, getPublishingQueue } from "../../services/queueService";
import "./Queue.css";

const statusStyles = {
  QUEUED: "badge-queued",
  SCHEDULED: "badge-scheduled",
  DRAFT: "badge-draft",
  CANCELLED: "badge-draft",
  FAILED: "badge-draft",
};

export default function Queue() {
  const navigate = useNavigate();
  const [queueItems, setQueueItems] = useState([]);
  const [postsById, setPostsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueue = async () => {
    try {
      setError("");
      const [queueData, postsData] = await Promise.all([
        getPublishingQueue(),
        getPosts(),
      ]);

      const postMap = {};
      (postsData.posts || []).forEach((post) => {
        postMap[post.post_id] = post;
      });

      setPostsById(postMap);
      setQueueItems(queueData.queue || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleCancel = async (queueId) => {
    const confirmed = window.confirm("Remove this item from the queue?");

    if (!confirmed) {
      return;
    }

    try {
      await cancelQueueItem(queueId);
      await loadQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="queue-container">
      <div className="queue-header">
        <div>
          <p className="eyebrow-text">Publication Queue</p>
          <h1 className="page-title">Queued Publication</h1>
          <p className="page-subtitle">
            Review upcoming posts, update scheduling details, and keep your content pipeline moving.
          </p>
        </div>
        <button className="queue-action-btn" onClick={() => navigate("/scheduler")}>
          + Add Publication
        </button>
      </div>

      {loading && <p>Loading queue...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      <div className="queue-list">
        {queueItems.length === 0 && !loading ? (
          <p>No queued publications yet.</p>
        ) : (
          queueItems.map((item) => {
            const post = postsById[item.post_id];

            return (
              <article key={item.queue_id} className="queue-card">
                <div className="queue-card-head">
                  <span className="queue-time">
                    {item.scheduled_at
                      ? new Date(item.scheduled_at).toLocaleString()
                      : "Not scheduled"}
                  </span>
                  <span className={`queue-badge ${statusStyles[item.status] || "badge-queued"}`}>
                    {item.status}
                  </span>
                </div>
                <p className="queue-body">
                  {post?.caption || post?.title || `Post #${item.post_id}`}
                </p>
                <div className="queue-card-footer">
                  <button className="card-btn secondary" onClick={() => navigate("/scheduler")}>
                    Edit
                  </button>
                  <button
                    className="card-btn muted"
                    onClick={() => handleCancel(item.queue_id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
