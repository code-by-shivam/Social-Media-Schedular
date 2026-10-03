import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../services/authServices";
import { getProfile } from "../services/profileService";
import { getToken, normalizeRole, removeToken, setToken } from "../services/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const DEV_ADMIN_EMAIL = "admin@socialpilot.com";
const DEV_ADMIN_PASSWORD = "admin123";
const DEV_CREATOR_EMAIL = "creator@socialpilot.com";
const DEV_CREATOR_PASSWORD = "creator123";
const DEV_BUSINESS_EMAIL = "buser@socialpilot.com";
const DEV_BUSINESS_PASSWORD = "buser123";
const DEV_MARKETING_EMAIL = "marketing@socialpilot.com";
const DEV_MARKETING_PASSWORD = "marketing123";

const DEV_ADMIN_TOKEN = "development-admin-session";
const DEV_CREATOR_TOKEN = "development-creator-session";
const DEV_BUSINESS_TOKEN = "development-business-session";
const DEV_MARKETING_TOKEN = "development-marketing-session";

const buildDevUser = ({
  id,
  name,
  email,
  role,
  status,
  token,
  phone,
  location,
  avatar,
  bio,
}) => ({
  id,
  name,
  email,
  role,
  status,
  token,
  phone,
  location,
  avatar,
  bio,
});

const DEV_USERS = {
  [DEV_ADMIN_EMAIL]: buildDevUser({
    id: 1,
    name: "System Administrator",
    email: DEV_ADMIN_EMAIL,
    role: "Administrator",
    status: "Active",
    token: DEV_ADMIN_TOKEN,
    phone: "+91 9876543210",
    location: "Coimbatore",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    bio: "Operationally sharp and focused on the platform health of every campaign.",
  }),
  "admin2@socialpilot.com": buildDevUser({
    id: 2,
    name: "Priya Nair",
    email: "admin2@socialpilot.com",
    role: "Administrator",
    status: "Inactive",
    token: "development-admin-inactive-session",
    phone: "+91 9811122233",
    location: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    bio: "Blends governance with strong editorial planning and team alignment.",
  }),
  [DEV_CREATOR_EMAIL]: buildDevUser({
    id: 3,
    name: "Alicia Grant",
    email: DEV_CREATOR_EMAIL,
    role: "Content Creator",
    status: "Active",
    token: DEV_CREATOR_TOKEN,
    phone: "+91 9000011111",
    location: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
    bio: "Builds story-led content systems with a strong audience-first creative direction.",
  }),
  "creator2@socialpilot.com": buildDevUser({
    id: 4,
    name: "Rohan Mehta",
    email: "creator2@socialpilot.com",
    role: "Content Creator",
    status: "Inactive",
    token: "development-creator-inactive-session",
    phone: "+91 9099988877",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    bio: "Creates campaign visuals and short-form stories with strong performance instincts.",
  }),
  [DEV_BUSINESS_EMAIL]: buildDevUser({
    id: 5,
    name: "Maya Brooks",
    email: DEV_BUSINESS_EMAIL,
    role: "Business User",
    status: "Active",
    token: DEV_BUSINESS_TOKEN,
    phone: "+91 9123456780",
    location: "Bangalore",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    bio: "Connects sales goals, customer journeys, and content performance into one rhythm.",
  }),
  "buser2@socialpilot.com": buildDevUser({
    id: 6,
    name: "Sanjay Patel",
    email: "buser2@socialpilot.com",
    role: "Business User",
    status: "Inactive",
    token: "development-business-inactive-session",
    phone: "+91 9345678901",
    location: "Pune",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
    bio: "Tracks revenue impact and campaign efficiency with a practical, data-led lens.",
  }),
  [DEV_MARKETING_EMAIL]: buildDevUser({
    id: 7,
    name: "Elena Pierce",
    email: DEV_MARKETING_EMAIL,
    role: "Marketing Team",
    status: "Active",
    token: DEV_MARKETING_TOKEN,
    phone: "+91 9988776655",
    location: "Chennai",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    bio: "Turns audience insight into low-noise campaign ideas that move fast and convert well.",
  }),
  "marketing2@socialpilot.com": buildDevUser({
    id: 8,
    name: "Aarav Iyer",
    email: "marketing2@socialpilot.com",
    role: "Marketing Team",
    status: "Inactive",
    token: "development-marketing-inactive-session",
    phone: "+91 9055500011",
    location: "Kochi",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    bio: "Focuses on launch planning, reporting clarity, and audience retention across campaigns.",
  }),
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const data = await getProfile();

    setUser({
      ...data.user,
      role: normalizeRole(data.user.role),
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      if (import.meta.env.DEV) {
        const existingUser = Object.values(DEV_USERS).find((user) => user.token === token);

        if (existingUser) {
          setUser(existingUser);
          setLoading(false);
          return;
        }
      }

      try {
        await loadUser();
      } catch {
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    if (import.meta.env.DEV) {
      const devUser = Object.values(DEV_USERS).find(
        (user) => user.email.toLowerCase() === email.toLowerCase() &&
          ((user.email === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD) ||
            (user.email === DEV_CREATOR_EMAIL && password === DEV_CREATOR_PASSWORD) ||
            (user.email === DEV_BUSINESS_EMAIL && password === DEV_BUSINESS_PASSWORD) ||
            (user.email === DEV_MARKETING_EMAIL && password === DEV_MARKETING_PASSWORD))
      );

      if (devUser) {
        setToken(devUser.token);
        setUser(devUser);
        return true;
      }
    }

    await apiLogin(email, password);
    await loadUser();
    return true;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
