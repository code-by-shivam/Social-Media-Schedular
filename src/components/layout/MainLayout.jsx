import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PilotChatWidget from "../common/PilotChatWidget";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="sp-app-wrapper">
      <Sidebar />
      <Navbar />
      <main className="sp-main-content">
        <Outlet />
      </main>
      <PilotChatWidget />
    </div>
  );
}

export default MainLayout;