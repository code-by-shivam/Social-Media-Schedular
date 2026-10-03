import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, Plus } from "lucide-react";
import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  getAccounts,
  connectAccount,
  deleteAccount,
} from "../../services/socialService";
import "./SocialAccounts.css";

const PLATFORM_ICONS = {
  LinkedIn: <FaLinkedin size={26} />,
  Instagram: <FaInstagram size={26} />,
  Facebook: <FaFacebook size={26} />,
  Twitter: <FaXTwitter size={26} />,
  YouTube: <FaLinkedin size={26} />,
  Pinterest: <FaInstagram size={26} />,
};

const DEFAULT_PLATFORMS = [
  { platform: "LinkedIn", name: "LinkedIn Studio", handle: "" },
  { platform: "Instagram", name: "Instagram Editorial", handle: "" },
  { platform: "Facebook", name: "Facebook Page", handle: "" },
  { platform: "Twitter", name: "X Channel", handle: "" },
];

function SocialAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  const loadAccounts = async () => {
    try {
      setError("");
      const data = await getAccounts();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const getAccountForPlatform = (platform) => {
    return accounts.find((account) => {
      const backendPlatform = account.platform.toLowerCase();
      const frontendPlatform = platform.toLowerCase();

      if (
        (backendPlatform === "x" && frontendPlatform === "twitter") ||
        (backendPlatform === "twitter" && frontendPlatform === "x")
      ) {
        return true;
      }

      return backendPlatform === frontendPlatform;
    });
  };

  const handleConnect = async (platform) => {
    const username = window.prompt(`Enter your ${platform} username:`);

    if (!username) {
      return;
    }

    try {
      setConnectingPlatform(platform);
      await connectAccount(platform, username);
      await loadAccounts();
    } catch (err) {
      alert(err.message);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (accountId) => {
    const confirmed = window.confirm("Disconnect this social account?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteAccount(accountId);
      await loadAccounts();
    } catch (err) {
      alert(err.message);
    }
  };

  const displayAccounts = DEFAULT_PLATFORMS.map((item) => {
    const connected = getAccountForPlatform(item.platform);

    return {
      id: connected?.id,
      name: item.name,
      handle: connected ? `@${connected.username}` : "Not connected",
      icon: PLATFORM_ICONS[connected?.platform] || PLATFORM_ICONS.Twitter,
      connected: Boolean(connected),
      platform: item.platform,
      followers: connected?.followers ?? 0,
      posts: connected?.posts ?? 0,
      engagement: connected?.engagement ?? 0,
    };
  });

  return (
    <div className="social-accounts-page">
      <div className="page-header">
        <div>
          <span className="eyebrow-text font-mono">CHANNEL ARCHITECTURE</span>
          <h1 className="page-title font-serif">Platform Integrations</h1>
          <p className="page-subtitle">
            Synchronize your social media networks into a unified editorial workflow.
          </p>
        </div>

        <button className="sp-dark-btn" onClick={loadAccounts}>
          <Plus size={16} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      <div className="accounts-sync-bar hairline-b font-mono">
        <div className="sync-bar-left">
          <RefreshCw size={14} className="spin-icon" />
          <span>
            {loading
              ? "SYNCING ACCOUNTS..."
              : `CONNECTED ACCOUNTS: ${accounts.length}`}
          </span>
        </div>
        <div className="sync-bar-right">
          <span>{error ? "SYNC ERROR" : "API PIPELINE ACTIVE"}</span>
        </div>
      </div>

      {error && (
        <p style={{ color: "#dc2626", padding: "1rem 0" }}>{error}</p>
      )}

      <div className="accounts-list-container">
        <div className="list-table-header hairline-b font-mono">
          <span className="col-platform">CHANNEL / HANDLE</span>
          <span className="col-stats">METRICS (FOLLOWERS / POSTS / ENG)</span>
          <span className="col-status">SYNC STATUS</span>
          <span className="col-action">ACTION</span>
        </div>

        {displayAccounts.map((account) => (
          <div className="account-flat-row hairline-b" key={account.platform}>
            <div className="col-platform account-identity">
              <div className="account-names">
                <span className="acc-name">{account.name}</span>
                <span className="acc-handle font-mono">{account.handle}</span>
              </div>
            </div>

            <div className="col-stats account-metrics">
              <div className="metric-pill">
                <span className="m-val font-serif">
                  {account.connected ? account.followers.toLocaleString() : "--"}
                </span>
                <span className="m-lbl font-mono">FOLLOWERS</span>
              </div>
              <div className="metric-pill">
                <span className="m-val font-serif">
                  {account.connected ? account.posts : "--"}
                </span>
                <span className="m-lbl font-mono">POSTS</span>
              </div>
              <div className="metric-pill">
                <span className="m-val font-serif">
                  {account.connected ? `${account.engagement}%` : "--"}
                </span>
                <span className="m-lbl font-mono">ENGAGEMENT</span>
              </div>
            </div>

            <div className="col-status account-status">
              {account.connected ? (
                <div className="status-label-connected font-mono">
                  <CheckCircle2 size={15} />
                  <span>CONNECTED</span>
                </div>
              ) : (
                <div className="status-label-disconnected font-mono">
                  <XCircle size={15} />
                  <span>DISCONNECTED</span>
                </div>
              )}
              <span className="sync-time font-mono">
                Last sync: {account.connected ? "Just now" : "Not connected"}
              </span>
            </div>

            <div className="col-action account-action">
              <button
                className={account.connected ? "sp-btn-outline" : "sp-btn-solid"}
                disabled={connectingPlatform === account.platform}
                onClick={() =>
                  account.connected
                    ? handleDisconnect(account.id)
                    : handleConnect(account.platform)
                }
              >
                {connectingPlatform === account.platform
                  ? "Connecting..."
                  : account.connected
                    ? "Disconnect"
                    : "Connect Channel"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialAccounts;
