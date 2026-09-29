import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Testbed configs", end: true },
  { to: "/sessions", label: "Capture sessions" },
  { to: "/classification", label: "Classification" },
  { to: "/assessment", label: "Risk assessment" },
  { to: "/reports", label: "Reports" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="accent-dot" />
        VPN Analyzer
      </div>
      <div className="subhead">SIH26160 · NTRO</div>
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
