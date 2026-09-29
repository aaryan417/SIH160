import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import TestbedPage from "./pages/TestbedPage";
import SessionsPage from "./pages/SessionsPage";
import ClassificationPage from "./pages/ClassificationPage";
import AssessmentPage from "./pages/AssessmentPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-shell">
      <Sidebar key={refreshKey} />
      <div className="main-wrapper">
        <Header onRefresh={() => setRefreshKey((k) => k + 1)} />
        <main className="main">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/testbed" element={<TestbedPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/classification" element={<ClassificationPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
