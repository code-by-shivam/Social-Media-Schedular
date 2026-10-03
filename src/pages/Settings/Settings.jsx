import React, { useEffect, useState } from "react";
import {
  Lock,
  Bell,
  Trash2,
  LogOut,
  ShieldCheck,
  Sliders,
  Palette,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  changePassword,
  deleteAccount,
  getPermissions,
  getPreferences,
  updatePreferences,
} from "../../services/settingsService";
import "./Settings.css";

const THEME_STORAGE_KEY = "socialpilot-theme";

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const loadPreferences = async () => {
      try {
        const data = await getPreferences();
        const emailEnabled = data.preferences?.email_notification ?? true;
        const pushEnabled = data.preferences?.push_notification ?? true;
        setNotifications(emailEnabled && pushEnabled);
        setAutoSync(data.preferences?.auto_sync ?? true);
      } catch (err) {
        setError(err.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = async (preferences, rollback) => {
    try {
      setError("");
      setMessage("");
      await updatePreferences(preferences);
      setMessage("Settings saved.");
    } catch (err) {
      rollback();
      setError(err.message || "Unable to save settings.");
    }
  };

  const applyTheme = (nextTheme) => {
    const normalizedTheme = nextTheme === "dark" ? "dark" : "light";
    setTheme(normalizedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    document.documentElement.setAttribute("data-theme", normalizedTheme);
  };

  const handleNotificationsToggle = () => {
    const nextValue = !notifications;
    setNotifications(nextValue);
    savePreferences(
      { email_notification: nextValue, push_notification: nextValue },
      () => setNotifications(!nextValue)
    );
  };

  const handleAutoSyncToggle = () => {
    const nextValue = !autoSync;
    setAutoSync(nextValue);
    savePreferences({ auto_sync: nextValue }, () => setAutoSync(!nextValue));
  };

  const handleThemeChange = (selectedTheme) => {
    applyTheme(selectedTheme);
    setMessage("Appearance updated.");
  };

  const handlePasswordUpdate = async () => {
    const currentPassword = window.prompt("Enter your current password:");
    if (currentPassword === null) return;

    const newPassword = window.prompt("Enter your new password (minimum 8 characters):");
    if (newPassword === null) return;

    const confirmation = window.prompt("Confirm your new password:");
    if (confirmation !== newPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update password.");
    } finally {
      setSaving(false);
    }
  };

  const handlePermissions = async () => {
    try {
      const data = await getPermissions();
      window.alert(`Role: ${data.role}\n\nPermissions:\n- ${data.permissions.join("\n- ")}`);
    } catch (err) {
      setError(err.message || "Unable to load permissions.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to purge this studio workspace?")) {
      try {
        setSaving(true);
        await deleteAccount();
        await logout();
        navigate("/");
      } catch (err) {
        setError(err.message || "Unable to purge workspace data.");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header hairline-b">
        <div>
          <span className="eyebrow-text font-mono">SYSTEM PREFERENCES</span>
          <h1 className="page-title font-serif">Workspace Configuration</h1>
          <p className="page-subtitle">
            Configure security protocols, API sync behavior, and notification dispatch settings.
          </p>
        </div>

        <div className="status-indicator font-mono">
          <span>{loading ? "LOADING SETTINGS" : "SETTINGS SYNCHRONIZED"}</span>
        </div>
      </div>

      {error && <p className="settings-feedback settings-error">{error}</p>}
      {message && <p className="settings-feedback">{message}</p>}

      {/* Settings Flat List (NO BOX CARDS!) */}
      <div className="settings-flat-list">
        {/* Item 1 */}
        <div className="setting-flat-row hairline-b">
          <div className="setting-meta">
            <Lock size={20} className="setting-icon" />
            <div className="setting-titles">
              <h3 className="setting-name">Security Password</h3>
              <p className="setting-desc">Update your workspace authentication credentials.</p>
            </div>
          </div>
          <div className="setting-action">
            <button
              className="sp-setting-btn sp-setting-btn-outline"
              onClick={handlePasswordUpdate}
              disabled={saving}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Item 2 */}
        <div className="setting-flat-row hairline-b">
          <div className="setting-meta">
            <Bell size={20} className="setting-icon" />
            <div className="setting-titles">
              <h3 className="setting-name">Email & Push Notifications</h3>
              <p className="setting-desc">Receive real-time alerts when scheduled posts publish or fail.</p>
            </div>
          </div>
          <div className="setting-action">
            <button
              className={`sp-setting-btn toggle-switch-btn ${notifications ? "active" : ""}`}
              onClick={handleNotificationsToggle}
              disabled={loading || saving}
            >
              <span className="toggle-slider font-mono">
                {notifications ? "ENABLED" : "DISABLED"}
              </span>
            </button>
          </div>
        </div>

        {/* Item 3 */}
        <div className="setting-flat-row hairline-b">
          <div className="setting-meta">
            <Palette size={20} className="setting-icon" />
            <div className="setting-titles">
              <h3 className="setting-name">Workspace Appearance</h3>
              <p className="setting-desc">Switch between the studio’s light and dark presentation modes.</p>
            </div>
          </div>
          <div className="setting-action">
            <div className="theme-toggle-group" aria-label="Theme selector">
              <button
                type="button"
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => handleThemeChange("light")}
              >
                LIGHT
              </button>
              <button
                type="button"
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => handleThemeChange("dark")}
              >
                DARK
              </button>
            </div>
          </div>
        </div>

        {/* Item 4 */}
        <div className="setting-flat-row hairline-b">
          <div className="setting-meta">
            <Sliders size={20} className="setting-icon" />
            <div className="setting-titles">
              <h3 className="setting-name">Automatic API Pipeline Sync</h3>
              <p className="setting-desc">Fetch analytics and audience metric updates in 15-minute background loops.</p>
            </div>
          </div>
          <div className="setting-action">
            <button
              className={`sp-setting-btn toggle-switch-btn ${autoSync ? "active" : ""}`}
              onClick={handleAutoSyncToggle}
              disabled={loading || saving}
            >
              <span className="toggle-slider font-mono">
                {autoSync ? "ENABLED" : "DISABLED"}
              </span>
            </button>
          </div>
        </div>

        {/* Item 5 */}
        <div className="setting-flat-row hairline-b">
          <div className="setting-meta">
            <ShieldCheck size={20} className="setting-icon" />
            <div className="setting-titles">
              <h3 className="setting-name">Privacy & Data Governance</h3>
              <p className="setting-desc">Review API OAuth scopes, workspace permissions, and audit logs.</p>
            </div>
          </div>
          <div className="setting-action">
            <button className="sp-setting-btn sp-setting-btn-outline" onClick={handlePermissions}>
              Permissions
            </button>
          </div>
        </div>

        {/* Item 6 */}
        <div className="setting-flat-row hairline-b">
          <div className="setting-meta">
            <LogOut size={20} className="setting-icon" />
            <div className="setting-titles">
              <h3 className="setting-name">Terminate Active Session</h3>
              <p className="setting-desc">Sign out of the current administrative studio workspace session.</p>
            </div>
          </div>
          <div className="setting-action">
            <button className="sp-setting-btn sp-setting-btn-solid" onClick={handleLogout}>
              Sign Out Session
            </button>
          </div>
        </div>

        {/* Item 7: Purge Workspace */}
        <div className="setting-flat-row hairline-b danger-row">
          <div className="setting-meta">
            <Trash2 size={20} className="setting-icon danger-icon" />
            <div className="setting-titles">
              <h3 className="setting-name">Purge Workspace Data</h3>
              <p className="setting-desc">Permanently remove connected platforms, queued media, and metrics.</p>
            </div>
          </div>
          <div className="setting-action">
            <button
              className="sp-setting-btn danger-btn font-mono"
              onClick={handleDelete}
              disabled={saving}
            >
              PURGE DATA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;