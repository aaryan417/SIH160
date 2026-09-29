import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, createSyntheticPcapBlob } from "../api";

export default function LandingPage() {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);

  async function handleDemoLaunch() {
    setSeeding(true);
    try {
      const configs = await api.seedDemoData();
      if (configs && configs.length > 0) {
        const dummyPcap1 = createSyntheticPcapBlob("AES-GCM", 36);
        const s1 = await api.uploadCapture(configs[0].config_id, dummyPcap1);

        const dummyPcap2 = createSyntheticPcapBlob("3DES", 22);
        const s2 = await api.uploadCapture(configs[1].config_id, dummyPcap2);

        if (s1 && s1.session_id) {
          try {
            await api.runClassification(s1.session_id, "10.0.0.2");
            await api.runAssessment(s1.session_id);
            await api.generateReport(s1.session_id, "executive");
          } catch (e) {
            console.warn(e);
          }
        }
      }
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      navigate("/dashboard");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="vpn-landing-page">
      {/* Background Starry Mesh & Ambient Lighting */}
      <div className="vpn-ambient-glow" />
      <div className="vpn-grid-bg" />

      {/* Top Navbar */}
      <header className="vpn-navbar">
        <div className="vpn-nav-brand">
          <div className="vpn-shield-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span className="vpn-brand-text">
            VPN <span className="highlight">Analyzer</span>
          </span>
        </div>

        <nav className="vpn-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#technology">Technology</a>
          <a href="#about">About</a>
        </nav>

        <div className="vpn-nav-right">
          <Link to="/dashboard" className="vpn-btn-primary">
            <span>Get Started</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="vpn-hero-section">
        {/* Top Tag Pill */}
        <div className="vpn-hero-tag">
          <span className="tag-pulse-dot" />
          <span>AI-Powered VPN Traffic Analysis</span>
        </div>

        {/* Hero Title */}
        <h1 className="vpn-hero-title">
          Understand. Analyze.
          <br />
          <span className="vpn-gradient-text">Secure Your VPN Traffic.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="vpn-hero-subtitle">
          Automatically detect VPN protocols, encryption ciphers, and security
          risks from network traffic using AI and rule-based analysis.
        </p>

        {/* Action Buttons */}
        <div className="vpn-hero-actions">
          <Link to="/dashboard" className="vpn-btn-primary vpn-btn-lg">
            <span>Get Started</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <button
            onClick={handleDemoLaunch}
            disabled={seeding}
            className="vpn-btn-secondary vpn-btn-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            <span>{seeding ? "Preparing Demo…" : "View Demo"}</span>
          </button>
        </div>

        {/* Globe Visualization with Floating Protocol Tags */}
        <div className="vpn-globe-wrapper">
          {/* Floating Protocol Tags (Matching image) */}
          <div className="floating-tag tag-openvpn">
            <span className="tag-dot-blue" />
            <span>OpenVPN</span>
          </div>

          <div className="floating-tag tag-wireguard">
            <span className="tag-dot-purple" />
            <span>WireGuard</span>
          </div>

          <div className="floating-tag tag-ipsec">
            <span className="tag-dot-green" />
            <span>IPsec</span>
          </div>

          <div className="floating-tag tag-ikev2">
            <span className="tag-dot-blue" />
            <span>IKEv2</span>
          </div>

          <div className="floating-tag tag-ssl">
            <span className="tag-dot-purple" />
            <span>SSL/TLS</span>
          </div>

          {/* SVG Digital Earth Globe & Rings */}
          <div className="digital-globe-svg-container">
            <svg className="digital-globe" viewBox="0 0 600 600">
              <defs>
                <radialGradient id="globeSphere" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0b1b36" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#051024" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#030814" stopOpacity="1" />
                </radialGradient>
                <linearGradient id="orbitCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="orbitPurple" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Globe Outer Glow */}
              <circle cx="300" cy="300" r="210" fill="none" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" filter="url(#glow)" />
              <circle cx="300" cy="300" r="200" fill="url(#globeSphere)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />

              {/* Wireframe Longitude & Latitude Arcs */}
              <ellipse cx="300" cy="300" rx="198" ry="80" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
              <ellipse cx="300" cy="300" rx="198" ry="140" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
              <ellipse cx="300" cy="300" rx="80" ry="198" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
              <ellipse cx="300" cy="300" rx="140" ry="198" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
              <line x1="100" y1="300" x2="500" y2="300" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="300" y1="100" x2="300" y2="500" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Stylized Continents / Grid Nodes */}
              <g fill="rgba(0, 240, 255, 0.35)" filter="url(#glow)">
                {/* Node clusters representing connected global gateways */}
                <circle cx="230" cy="220" r="3" /><circle cx="245" cy="210" r="2" /><circle cx="260" cy="225" r="3" />
                <circle cx="210" cy="240" r="2.5" /><circle cx="225" cy="260" r="3" /><circle cx="270" cy="250" r="4" />
                <circle cx="340" cy="220" r="3" /><circle cx="360" cy="210" r="3" /><circle cx="380" cy="235" r="3.5" />
                <circle cx="350" cy="260" r="2.5" /><circle cx="390" cy="270" r="4" /><circle cx="330" cy="310" r="3" />
                <circle cx="280" cy="340" r="3.5" /><circle cx="310" cy="360" r="3" /><circle cx="260" cy="380" r="2.5" />
                <circle cx="420" cy="320" r="3" /><circle cx="440" cy="340" r="2" />
              </g>

              {/* Glowing Connections */}
              <path d="M 230 220 Q 280 200 340 220" fill="none" stroke="rgba(0, 240, 255, 0.6)" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M 270 250 Q 320 280 390 270" fill="none" stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1.5" />
              <path d="M 225 260 Q 260 320 280 340" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1" strokeDasharray="3 2" />

              {/* Holographic Glowing Orbital Trajectory Ring 1 (Cyan) */}
              <ellipse
                cx="300"
                cy="300"
                rx="250"
                ry="90"
                fill="none"
                stroke="url(#orbitCyan)"
                strokeWidth="2.5"
                transform="rotate(-28 300 300)"
                filter="url(#glow)"
              />

              {/* Holographic Glowing Orbital Trajectory Ring 2 (Purple) */}
              <ellipse
                cx="300"
                cy="300"
                rx="260"
                ry="80"
                fill="none"
                stroke="url(#orbitPurple)"
                strokeWidth="2.5"
                transform="rotate(32 300 300)"
                filter="url(#glow)"
              />
            </svg>
          </div>

          {/* Floating HUD Card on Bottom Right of Globe */}
          <div className="floating-hud-card">
            <div className="hud-metric-row">
              <span className="hud-indicator-dot dot-green" />
              <span className="hud-metric-label">Protocol Detection</span>
            </div>
            <div className="hud-metric-row">
              <span className="hud-indicator-dot dot-cyan" />
              <span className="hud-metric-label">Cipher Identification</span>
            </div>
            <div className="hud-metric-row">
              <span className="hud-indicator-dot dot-purple" />
              <span className="hud-metric-label">Risk Assessment</span>
            </div>
            <div className="hud-metric-row">
              <span className="hud-indicator-dot dot-blue" />
              <span className="hud-metric-label">Detailed Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* "Everything you need for VPN security analysis" */}
      <section id="features" className="vpn-features-section">
        <h2 className="vpn-section-heading">Everything you need for VPN security analysis</h2>

        <div className="vpn-cards-grid">
          {/* Card 1 */}
          <div className="vpn-feature-box">
            <div className="vpn-box-icon icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="6" height="6" rx="1" />
                <rect x="16" y="2" width="6" height="6" rx="1" />
                <rect x="16" y="16" width="6" height="6" rx="1" />
                <rect x="2" y="16" width="6" height="6" rx="1" />
                <line x1="8" y1="5" x2="16" y2="5" />
                <line x1="19" y1="8" x2="19" y2="16" />
                <line x1="16" y1="19" x2="8" y2="19" />
                <line x1="5" y1="16" x2="5" y2="8" />
              </svg>
            </div>
            <h3 className="vpn-box-title">Protocol Classification</h3>
            <p className="vpn-box-desc">
              Detect OpenVPN, WireGuard, IPsec, SSL/TLS and more.
            </p>
          </div>

          {/* Card 2 */}
          <div className="vpn-feature-box">
            <div className="vpn-box-icon icon-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 className="vpn-box-title">Encryption Analysis</h3>
            <p className="vpn-box-desc">
              Identify ciphers, key lengths and handshake details.
            </p>
          </div>

          {/* Card 3 */}
          <div className="vpn-feature-box">
            <div className="vpn-box-icon icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="vpn-box-title">Risk Assessment</h3>
            <p className="vpn-box-desc">
              Evaluate security configuration and compliance issues.
            </p>
          </div>

          {/* Card 4 */}
          <div className="vpn-feature-box">
            <div className="vpn-box-icon icon-pink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 className="vpn-box-title">Detailed Reports</h3>
            <p className="vpn-box-desc">
              Generate technical and executive reports.
            </p>
          </div>
        </div>
      </section>

      {/* "How it works" 5 Simple Steps */}
      <section id="how-it-works" className="vpn-steps-section">
        <h2 className="vpn-section-heading">How it works</h2>
        <p className="vpn-section-subheading">
          From packet capture to actionable security insights in 5 simple steps.
        </p>

        <div className="vpn-steps-row">
          {/* Step 1 */}
          <div className="vpn-step-item">
            <div className="step-badge-number">1</div>
            <div className="vpn-step-box">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <circle cx="9" cy="9" r="1.5" />
                  <circle cx="15" cy="9" r="1.5" />
                  <circle cx="9" cy="15" r="1.5" />
                  <circle cx="15" cy="15" r="1.5" />
                </svg>
              </div>
              <h4 className="step-title">Configure</h4>
              <p className="step-desc">Set up analysis parameters</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="vpn-step-item">
            <div className="step-badge-number">2</div>
            <div className="vpn-step-box">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h4 className="step-title">Upload Capture</h4>
              <p className="step-desc">Upload PCAP file or capture traffic</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="vpn-step-item">
            <div className="step-badge-number">3</div>
            <div className="vpn-step-box">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.1 5 7.4V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.6c3-1.3 5-4.1 5-7.4a8 8 0 0 0-8-8z" />
                  <path d="M9.5 9h5" />
                  <path d="M9.5 13h5" />
                </svg>
              </div>
              <h4 className="step-title">Classify</h4>
              <p className="step-desc">AI/Rule-based protocol detection</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="vpn-step-item">
            <div className="step-badge-number">4</div>
            <div className="vpn-step-box">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h4 className="step-title">Assess</h4>
              <p className="step-desc">Security risk evaluation</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="vpn-step-item">
            <div className="step-badge-number">5</div>
            <div className="vpn-step-box">
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h4 className="step-title">Generate Report</h4>
              <p className="step-desc">Download detailed technical report</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner ("Ready to analyze your VPN traffic?") */}
      <section className="vpn-bottom-cta-section">
        <div className="vpn-cta-card">
          <div className="cta-left">
            <h2 className="cta-heading">Ready to analyze your VPN traffic?</h2>
            <p className="cta-subheading">
              Start analyzing network captures and get security insights in minutes.
            </p>
            <Link to="/dashboard" className="vpn-btn-primary vpn-btn-lg">
              <span>Get Started</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          <div className="cta-right">
            <div className="cta-check-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>No installation required</span>
            </div>
            <div className="cta-check-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Supports multiple VPN protocols</span>
            </div>
            <div className="cta-check-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>AI-powered analysis</span>
            </div>
            <div className="cta-check-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Detailed security reports</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
