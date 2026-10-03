import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { USERS } from "../../data/users";
import { UserPlus, Pencil, Trash2, Eye } from "lucide-react";
import "./UserManagement.css";

const isDarkChartTheme = () => {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.theme === "dark";
};

const statusPaletteDark = ["#f5efe7", "#d4c2a4", "#b59a76"];

function CustomChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const payloadData = payload[0]?.payload || {};
  const userName = payloadData.userName || payloadData.name || payloadData.role || "User";

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{userName}</div>
      <div className="chart-tooltip-body chart-tooltip-stack">
        {payload
          .filter((entry) => Number.isFinite(entry.value) && entry.value > 0)
          .map((entry) => (
            <div key={entry.dataKey} className="chart-tooltip-row">
              <span className="chart-tooltip-dot" style={{ background: entry.fill || "#111827" }} />
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function UserManagement() {

  const [users, setUsers] = useState(USERS);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Total");
  const [roleFilter, setRoleFilter] = useState("All");

  const darkModeChart = isDarkChartTheme();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Content Creator",
    phone: "",
    location: "",
    bio: "",
    status: "Active",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddUser = () => {

    const emailExists = users.some(
        (u) =>
            u.email === newUser.email &&
            (!isEditing || u.id !== editingUser.id)
        );

        if (emailExists) {
        alert("Email already exists!");
        return;
    }

    if (isEditing) {

        setUsers(
        users.map((u) =>
            u.id === editingUser.id
            ? {
                ...newUser,
                id: editingUser.id,
                }
            : u
        )
        );

    } else {

        const user = {
        id: users.length + 1,
        ...newUser,
        };

        setUsers([...users, user]);
    }

    setShowModal(false);
    setIsEditing(false);
    setEditingUser(null);

    setNewUser({
        name: "",
        email: "",
        password: "",
        role: "Content Creator",
        phone: "",
        location: "",
        bio: "",
        status: "Active",
    });
  };

  const handleDelete = (id) => {

    const confirmDelete = window.confirm(
        "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    setUsers(users.filter((user) => user.id !== id));
  };

  const handlePreviewUser = (user) => {
    const previewWindow = window.open("", "_blank", "width=980,height=720");

    if (!previewWindow) return;

    const safeName = user.name || "User Profile";
    const safeRole = user.role || "Member";
    const safeEmail = user.email || "email@example.com";
    const safePhone = user.phone || "+91 90000 00000";
    const safeLocation = user.location || "Unknown location";
    const safeBio = user.bio || "Thoughtful operator focused on community growth and platform execution.";

    const html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${safeName} profile</title>
          <style>
            :root {
              --c-cream: #f7f0e5;
              --c-taupe: #58554e;
              --c-dark: #27251f;
              --c-white: #ffffff;
              --c-taupe-20: rgba(88, 85, 78, 0.2);
              --c-taupe-40: rgba(88, 85, 78, 0.4);
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: var(--c-cream);
              font-family: Arial, sans-serif;
              color: var(--c-dark);
            }
            .profile-page {
              display: flex;
              flex-direction: column;
              max-width: 1100px;
              margin: 0 auto;
              padding: 28px 32px 48px;
              color: var(--c-dark);
            }
            .profile-cover-frame {
              position: relative;
              height: 240px;
              width: 100%;
              overflow: hidden;
              border: 1px solid var(--c-taupe-20);
              margin-bottom: 28px;
              background: linear-gradient(135deg, #111827 0%, #e5e7eb 50%, #111827 100%);
              filter: grayscale(1);
              border-radius: 18px;
            }
            .cover-photo {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
              filter: grayscale(1) contrast(1.2) brightness(0.9);
              opacity: 0.8;
            }
            .cover-shade {
              position: absolute;
              inset: 0;
              background: linear-gradient(180deg, rgba(39, 37, 31, 0.2) 0%, rgba(39, 37, 31, 0.6) 100%);
            }
            .cover-tag {
              position: absolute;
              top: 16px;
              left: 16px;
              background: var(--c-dark);
              color: var(--c-cream);
              font-size: 10px;
              letter-spacing: 0.2em;
              padding: 4px 12px;
              font-weight: 700;
            }
            .profile-header-row {
              display: flex;
              align-items: flex-start;
              gap: 28px;
              padding: 0 6px 28px;
              margin-bottom: 28px;
              border-bottom: 1px solid var(--c-taupe-20);
            }
            .avatar-frame {
              position: relative;
              width: 90px;
              height: 90px;
              flex-shrink: 0;
            }
            .avatar-photo {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid var(--c-dark);
              background: linear-gradient(135deg, #d8cdbd, #f3e5d2);
              filter: grayscale(1);
            }
            .online-indicator {
              position: absolute;
              bottom: 4px;
              right: 4px;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background-color: var(--c-dark);
              border: 2px solid var(--c-cream);
            }
            .profile-title-block {
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            .profile-name {
              font-size: 34px;
              font-weight: 700;
              color: var(--c-dark);
              line-height: 1.1;
              margin: 0;
              font-family: Georgia, serif;
            }
            .profile-role {
              font-size: 12px;
              letter-spacing: 0.15em;
              color: var(--c-taupe);
              margin-top: 4px;
              margin-bottom: 0;
            }
            .profile-bio-row {
              display: flex;
              flex-direction: column;
              gap: 10px;
              padding: 0 6px 28px;
              margin-bottom: 28px;
              border-bottom: 1px solid var(--c-taupe-20);
            }
            .bio-label {
              font-size: 10px;
              letter-spacing: 0.2em;
              color: var(--c-taupe);
              font-weight: 600;
            }
            .bio-text {
              font-size: 20px;
              color: var(--c-dark);
              line-height: 1.4;
              font-style: italic;
              margin: 0;
            }
            .profile-details-grid {
              display: flex;
              flex-direction: column;
              padding: 0 6px;
            }
            .detail-flat-row {
              display: grid;
              grid-template-columns: 240px 1fr;
              align-items: center;
              padding: 22px 0;
              border-bottom: 1px solid var(--c-taupe-20);
              min-height: 78px;
            }
            .detail-label-side {
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 11px;
              letter-spacing: 0.15em;
              color: var(--c-taupe);
              font-weight: 600;
            }
            .detail-value-side {
              display: flex;
              align-items: center;
            }
            .value-text {
              font-size: 15px;
              color: var(--c-dark);
              font-weight: 500;
            }
            .badge-value {
              font-size: 11px;
              letter-spacing: 0.1em;
              padding: 4px 10px;
              border: 1px solid var(--c-taupe-40);
              background: var(--c-dark);
              color: var(--c-cream);
            }
            @media (max-width: 720px) {
              .profile-page { padding: 20px 18px 32px; }
              .profile-cover-frame { height: 180px; }
              .profile-header-row { gap: 18px; flex-direction: column; align-items: flex-start; }
              .detail-flat-row { grid-template-columns: 1fr; gap: 10px; padding: 18px 0; }
            }
          </style>
        </head>
        <body>
          <div class="profile-page">
            <div class="profile-cover-frame">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Profile cover" class="cover-photo" />
              <div class="cover-shade"></div>
              <div class="cover-tag">PROFILE OVERVIEW</div>
            </div>

            <div class="profile-header-row">
              <div class="avatar-frame">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" alt="${safeName}" class="avatar-photo" />
                <span class="online-indicator"></span>
              </div>

              <div class="profile-title-block">
                <h1 class="profile-name">${safeName}</h1>
                <p class="profile-role">${safeRole}</p>
              </div>
            </div>

            <div class="profile-bio-row">
              <span class="bio-label">EDITORIAL MANIFESTO</span>
              <p class="bio-text">"${safeBio}"</p>
            </div>

            <div class="profile-details-grid">
              <div class="detail-flat-row">
                <div class="detail-label-side">EMAIL ADDRESS</div>
                <div class="detail-value-side"><span class="value-text">${safeEmail}</span></div>
              </div>

              <div class="detail-flat-row">
                <div class="detail-label-side">PHONE DIRECT</div>
                <div class="detail-value-side"><span class="value-text">${safePhone}</span></div>
              </div>

              <div class="detail-flat-row">
                <div class="detail-label-side">ACCESS LEVEL</div>
                <div class="detail-value-side"><span class="badge-value">${safeRole.toUpperCase()}</span></div>
              </div>

              <div class="detail-flat-row">
                <div class="detail-label-side">PRIMARY LOCATION</div>
                <div class="detail-value-side"><span class="value-text">${safeLocation}</span></div>
              </div>
            </div>
          </div>
        </body>
      </html>`;

    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  const baseFilteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, roleFilter, search]);

  const statusData = useMemo(() => {
    const total = baseFilteredUsers.length;
    const active = baseFilteredUsers.filter((user) => user.status === "Active").length;
    const inactive = baseFilteredUsers.filter((user) => user.status !== "Active").length;

    return [
      { name: "Total", value: total, color: "#111111" },
      { name: "Active", value: active, color: "#4b4b4b" },
      { name: "Inactive", value: inactive, color: "#d1d5db" },
    ];
  }, [baseFilteredUsers]);

  const roleData = useMemo(() => {
    const selectedUsers = roleFilter === "All"
      ? baseFilteredUsers
      : baseFilteredUsers.filter((user) => user.role === roleFilter);

    return selectedUsers.map((user) => {
      const seed = user.name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

      return {
        userName: user.name,
        name: user.name,
        role: user.role,
        queue: 2 + (seed % 4),
        post: 3 + ((seed + 2) % 6),
        campaigns: 1 + ((seed + 5) % 4),
      };
    });
  }, [baseFilteredUsers, roleFilter]);

  const handleExportCsv = () => {
    const headers = ["Name", "Email", "Role", "Phone", "Location", "Status"];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.phone,
      user.location,
      user.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `user-management-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredUsers = baseFilteredUsers.filter((user) => {
    const matchesStatus =
      selectedStatus === "Total" || user.status === selectedStatus;

    return matchesStatus;
  });

  return (

    <div className="users-page">

      <div className="page-header">
        <div>
          <span className="eyebrow-text font-mono">
            ADMINISTRATION
          </span>

          <h1 className="page-title font-serif">
            User Management
          </h1>

          <p className="page-subtitle">
            Manage users, permissions and roles.
          </p>
        </div>
      </div>

      <div className="stats-container chart-grid">

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Status breakdown</h2>
              <p>Click a slice to update the role bar chart.</p>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={5}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                  stroke={darkModeChart ? "rgba(245,239,231,0.9)" : "rgba(255,255,255,0.85)"}
                  strokeWidth={2}
                  onClick={(payload) => setSelectedStatus(payload.name)}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={darkModeChart ? statusPaletteDark[index % statusPaletteDark.length] : entry.color}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomChartTooltip />}
                  cursor={{ stroke: "#111827", strokeWidth: 1, strokeDasharray: "4 4" }}
                  wrapperStyle={{ outline: "none", pointerEvents: "none" }}
                  isAnimationActive={true}
                  animationDuration={150}
                  filterNull={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>{roleFilter === "All" ? "User workload" : `${roleFilter} workload`}</h2>
              <p>Stacked activity for each user by queue, posts and campaigns.</p>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={roleData} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={darkModeChart ? 0.38 : 0.2}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: darkModeChart ? "#f5efe7" : "#111111" }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  stroke={darkModeChart ? "#f5efe7" : "#111111"}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: darkModeChart ? "#f5efe7" : "#111111" }}
                  stroke={darkModeChart ? "#f5efe7" : "#111111"}
                />
                <Tooltip
                  content={<CustomChartTooltip />}
                  wrapperStyle={{ outline: "none", pointerEvents: "none" }}
                  cursor={{ fill: darkModeChart ? "rgba(245,239,231,0.06)" : "rgba(17, 24, 39, 0.04)" }}
                  isAnimationActive={true}
                  animationDuration={150}
                  filterNull={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                  shared={false}
                />
                <Bar dataKey="queue" stackId="workload" fill={darkModeChart ? "#f5efe7" : "#111111"} radius={[6, 6, 0, 0]} />
                <Bar dataKey="post" stackId="workload" fill={darkModeChart ? "#d4c2a4" : "#4b4b4b"} radius={[6, 6, 0, 0]} />
                <Bar dataKey="campaigns" stackId="workload" fill={darkModeChart ? "#b59a76" : "#d1d5db"} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="toolbar toolbar-bottom">
        <div className="toolbar-search-row">
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option>All</option>
            <option>Administrator</option>
            <option>Business User</option>
            <option>Marketing Team</option>
            <option>Content Creator</option>
          </select>

          <div className="toolbar-action-group">
            <button className="filter-btn" onClick={handleExportCsv}>
              Export CSV
            </button>

            <button className="filter-btn clear" onClick={() => {
              setSearch("");
              setRoleFilter("All");
            }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <button className="floating-add-btn" onClick={() => setShowModal(true)}>
        <UserPlus size={18} />
        Add User
      </button>

      <div className="users-table">

        <div className="users-header font-mono">

          <span>Name</span>

          <span>Email</span>

          <span>Role</span>

          <span>Phone</span>

          <span>Status</span>

          <span>Actions</span>

        </div>

        {filteredUsers.map((user) => (

          <div
            className="users-row"
            key={user.id}
          >

            <span>{user.name}</span>

            <span>{user.email}</span>

            <span>{user.role}</span>

            <span>{user.phone}</span>

            <span className={`status-pill ${user.status === "Active" ? "active" : "inactive"}`}>
              {user.status}
            </span>

            <div className="action-buttons">

              <button
                className="icon-btn"
                title="Preview user workspace"
                onClick={() => handlePreviewUser(user)}
              >
                <Eye size={16} />
              </button>

              <button
                className="icon-btn"
                title="Edit user"
                onClick={() => {
                    setEditingUser(user);
                    setNewUser(user);
                    setIsEditing(true);
                    setShowModal(true);
                }}
              >

                <Pencil size={16} />

              </button>

              <button
                className="icon-btn delete"
                title="Delete user"
                onClick={() => handleDelete(user.id)}
              >

                <Trash2 size={16} />

              </button>

            </div>

          </div>

        ))}

      </div>

      {showModal && (

        <div className="modal-overlay">

        <div className="user-modal">

            <h2>{isEditing ? "Edit User" : "Add User"}</h2>

            <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) =>
                setNewUser({
                ...newUser,
                name: e.target.value,
                })
            }
            />

            <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
                setNewUser({
                ...newUser,
                email: e.target.value,
                })
            }
            />

            <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
                setNewUser({
                ...newUser,
                password: e.target.value,
                })
            }
            />

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role: e.target.value,
                })
              }
            >
              <option>Administrator</option>
              <option>Business User</option>
              <option>Marketing Team</option>
              <option>Content Creator</option>
            </select>

            <input
            placeholder="Phone"
            value={newUser.phone}
            onChange={(e) =>
                setNewUser({
                ...newUser,
                phone: e.target.value,
                })
            }
            />

            <input
            placeholder="Location"
            value={newUser.location}
            onChange={(e) =>
                setNewUser({
                ...newUser,
                location: e.target.value,
                })
            }
            />

            <textarea
            placeholder="Bio"
            value={newUser.bio}
            onChange={(e) =>
                setNewUser({
                ...newUser,
                bio: e.target.value,
                })
            }
            />

            <div className="modal-buttons">

            <button
                onClick={() => setShowModal(false)}
            >
                Cancel
            </button>

            <button
                className="sp-dark-btn"
                onClick={handleAddUser}
            >
                {isEditing ? "Update" : "Save"}
            </button>

            </div>

        </div>

        </div>

        )}

    </div>

  );

}

export default UserManagement;