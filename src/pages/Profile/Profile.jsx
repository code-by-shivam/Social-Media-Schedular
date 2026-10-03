import { useEffect, useState } from "react";
import {
  Mail,
  Shield,
  Phone,
  MapPin,
  Pencil,
  Check,
} from "lucide-react";
import "./Profile.css";
import { useAuth } from "../../context/AuthContext";

import {
  getProfile,
  updateProfile,
} from "../../services/profileService";

function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("/images.jpg");
  const [coverPreview, setCoverPreview] = useState("/ripples-of-sand-in-black-and-white.jpg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    name: user?.name || "",
    role: user?.role || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();

        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          role: data.user.role || "",
          phone: data.user.phone || "",
          location: data.user.location || "",
          bio: data.user.bio || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setError("");
      const data = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
      });

      setProfile({
        name: data.user.name || "",
        email: data.user.email || "",
        role: data.user.role || "",
        phone: data.user.phone || "",
        location: data.user.location || "",
        bio: data.user.bio || "",
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageChange = (event, setPreview) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="profile-page">
      {loading && <p>Loading profile...</p>}
      {error && <p style={{ color: "#dc2626", padding: "1rem" }}>{error}</p>}

      {/* Cover Photography Hero Frame */}
      <div className="profile-cover-frame hairline-b">
        <img
          src={coverPreview}
          alt="Profile cover photography"
          className="cover-photo"
        />
        <div className="cover-shade"></div>
        <div className="cover-tag font-mono">PROFILE OVERVIEW</div>
        {isEditing && (
          <label className="image-change-control cover-image-control">
            Change background
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImageChange(event, setCoverPreview)}
            />
          </label>
        )}
      </div>

      {/* Profile Header Row */}
      <div className="profile-header-row hairline-b">
        <div className="avatar-frame">
          <img
            src={avatarPreview}
            alt="Alex Vance"
            className="avatar-photo"
          />
          <span className="online-indicator"></span>
          {isEditing && (
            <label className="avatar-image-control" title="Change profile picture">
              <Pencil size={13} />
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleImageChange(event, setAvatarPreview)}
              />
            </label>
          )}
        </div>

        <div className="profile-title-block">
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="edit-name-input font-serif"
            />
          ) : (
            <h1 className="profile-name font-serif">{profile.name}</h1>
          )}
          <p className="profile-role font-mono">{profile.role}</p>
        </div>

        <div className="profile-header-action">
          {isEditing ? (
            <button className="sp-dark-btn" onClick={handleSave}>
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          ) : (
            <button className="sp-btn-outline" onClick={() => setIsEditing(true)}>
              <Pencil size={15} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Bio Statement */}
      <div className="profile-bio-row hairline-b">
        <span className="bio-label font-mono">EDITORIAL MANIFESTO</span>
        {isEditing ? (
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="bare-textarea"
            rows={2}
          />
        ) : (
          <p className="bio-text font-serif">"{profile.bio}"</p>
        )}
      </div>

      {/* Open Details List (NO BOX CARDS!) */}
      <div className="profile-details-grid">
        <div className="detail-flat-row hairline-b">
          <div className="detail-label-side font-mono">
            <Mail size={16} />
            <span>EMAIL ADDRESS</span>
          </div>
          <div className="detail-value-side">
            {isEditing ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bare-input"
              />
            ) : (
              <span className="value-text">{profile.email}</span>
            )}
          </div>
        </div>

        <div className="detail-flat-row hairline-b">
          <div className="detail-label-side font-mono">
            <Phone size={16} />
            <span>PHONE DIRECT</span>
          </div>
          <div className="detail-value-side">
            {isEditing ? (
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="bare-input"
              />
            ) : (
              <span className="value-text">{profile.phone}</span>
            )}
          </div>
        </div>

        <div className="detail-flat-row hairline-b">
          <div className="detail-label-side font-mono">
            <Shield size={16} />
            <span>ACCESS LEVEL</span>
          </div>
          <div className="detail-value-side">
            <span className="value-text badge-value font-mono">ADMINISTRATOR // SUPERUSER</span>
          </div>
        </div>

        <div className="detail-flat-row hairline-b">
          <div className="detail-label-side font-mono">
            <MapPin size={16} />
            <span>PRIMARY LOCATION</span>
          </div>
          <div className="detail-value-side">
            {isEditing ? (
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="bare-input"
              />
            ) : (
              <span className="value-text">{profile.location}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;