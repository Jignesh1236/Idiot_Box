import React, { useState } from "react";
import useSettings from "../shared/useSettings.jsx";
import EditorPage  from "./pages/EditorPage.jsx";
import "../../variables.css";
import "./settings.css";

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV = [
  { id: "editor", label: "Editor" },
  // Add more categories here — each needs a matching <Page> in the switch below
];

// ─── SettingsWindow ───────────────────────────────────────────────────────────
// Standalone root component rendered inside the settings BrowserWindow.
// OBS-style layout: fixed left sidebar + scrollable right content.
// ─────────────────────────────────────────────────────────────────────────────

const SettingsWindow = () => {
  const [activePage, setActivePage] = useState("editor");
  const [settings, updateSettings, loading] = useSettings();

  const renderPage = () => {
    if (loading) return <div style={{ color: "#555", fontSize: 12 }}>Loading...</div>;
    switch (activePage) {
      case "editor": return <EditorPage settings={settings} onSave={updateSettings} />;
      default:       return null;
    }
  };

  const pageTitle = NAV.find((n) => n.id === activePage)?.label ?? "";

  return (
    <div className="sw-shell">
      {/* Sidebar */}
      <div className="sw-sidebar">
        <div className="sw-sidebar__title">Settings</div>
        {NAV.map((item) => (
          <div
            key={item.id}
            className={`sw-nav-item${activePage === item.id ? " sw-nav-item--active" : ""}`}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="sw-content">
        <div className="sw-content__header">
          <span className="sw-content__title">{pageTitle}</span>
        </div>
        <div className="sw-content__body">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default SettingsWindow;
