import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import TestbedPage from "./pages/TestbedPage";
import SessionsPage from "./pages/SessionsPage";
import ClassificationPage from "./pages/ClassificationPage";
import AssessmentPage from "./pages/AssessmentPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

  // Root path displays the standalone, immersive VPN Analyzer landing page
  if (location.pathname === "/") {
    return <LandingPage />;
  }

  return (
    <div className="app-shell">
      <Sidebar key={refreshKey} />
      <div className="main-wrapper">
        <Header onRefresh={() => setRefreshKey((k) => k + 1)} />
        <main className="main">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/testbed" element={<TestbedPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/classification" element={<ClassificationPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

