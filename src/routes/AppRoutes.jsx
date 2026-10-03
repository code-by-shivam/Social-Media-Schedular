import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import SocialAccounts from "../pages/SocialAccounts/SocialAccounts";
import Scheduler from "../pages/Scheduler/Scheduler";
import AnalyticsDashboard from "../pages/AnalyticsDashboard/AnalyticsDashboard";
import OverallAnalysis from "../pages/AnalyticsDashboard/OverallAnalysis";
import Campaigns from "../pages/Campaigns/Campaigns";
import CampaignTracker from "../pages/Campaigns/CampaignTracker";
import CampaignAnalysis from "../pages/Campaigns/CampaignAnalysis";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import Drafts from "../pages/Drafts/Drafts";
import CalendarView from "../pages/Calendar/CalendarView";
import Queue from "../pages/Queue/Queue";
import UserManagement from "../pages/UserManagement/UserManagement";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES, PAGE_ACCESS } from "../utils/roles";

function AppRoutes() {
  const routeAccessMap = {
    "/dashboard": [ROLES.ADMIN, ROLES.CONTENT_CREATOR, ROLES.MARKETING, ROLES.BUSINESS],
    "/users": [ROLES.ADMIN],
    "/social-accounts": [ROLES.ADMIN, ROLES.CONTENT_CREATOR, ROLES.BUSINESS],
    "/scheduler": [ROLES.ADMIN, ROLES.CONTENT_CREATOR, ROLES.BUSINESS],
    "/drafts": [ROLES.ADMIN, ROLES.CONTENT_CREATOR],
    "/calendar": [ROLES.ADMIN, ROLES.CONTENT_CREATOR, ROLES.BUSINESS],
    "/queue": [ROLES.ADMIN, ROLES.CONTENT_CREATOR],
    "/analytics": [ROLES.ADMIN, ROLES.MARKETING, ROLES.BUSINESS],
    "/campaigns": [ROLES.ADMIN, ROLES.MARKETING, ROLES.BUSINESS],
    "/profile": [ROLES.ADMIN, ROLES.CONTENT_CREATOR, ROLES.MARKETING, ROLES.BUSINESS],
    "/settings": [ROLES.ADMIN, ROLES.CONTENT_CREATOR, ROLES.MARKETING, ROLES.BUSINESS],
  };

  const withRoleGuard = (path, element, roles) => (
    <Route
      key={path}
      path={path}
      element={<ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>}
    />
  );

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {withRoleGuard("/dashboard", <Dashboard />, routeAccessMap["/dashboard"])}
        {withRoleGuard("/users", <UserManagement />, routeAccessMap["/users"])}
        {withRoleGuard("/social-accounts", <SocialAccounts />, routeAccessMap["/social-accounts"])}
        {withRoleGuard("/scheduler", <Scheduler />, routeAccessMap["/scheduler"])}
        {withRoleGuard("/analytics", <OverallAnalysis />, routeAccessMap["/analytics"])}
        {withRoleGuard("/analytics/dashboard", <AnalyticsDashboard />, routeAccessMap["/analytics"])}
        {withRoleGuard("/campaigns", <Campaigns />, routeAccessMap["/campaigns"])}
        {withRoleGuard("/campaigns/track/:campaignId", <CampaignTracker />, routeAccessMap["/campaigns"])}
        {withRoleGuard("/campaigns/analysis/:campaignId", <CampaignAnalysis />, routeAccessMap["/campaigns"])}
        {withRoleGuard("/profile", <Profile />, routeAccessMap["/profile"])}
        {withRoleGuard("/settings", <Settings />, routeAccessMap["/settings"])}
        {withRoleGuard("/drafts", <Drafts />, routeAccessMap["/drafts"])}
        {withRoleGuard("/calendar", <CalendarView />, routeAccessMap["/calendar"])}
        {withRoleGuard("/queue", <Queue />, routeAccessMap["/queue"])}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
