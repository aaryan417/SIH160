import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TestbedPage from "./pages/TestbedPage";
import SessionsPage from "./pages/SessionsPage";
import ClassificationPage from "./pages/ClassificationPage";
import AssessmentPage from "./pages/AssessmentPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<TestbedPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/classification" element={<ClassificationPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </main>
    </div>
  );
}
