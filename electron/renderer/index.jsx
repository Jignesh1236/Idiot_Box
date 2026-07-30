import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Layout, Model, Actions, DockLocation } from "flexlayout-react";
import "./variables.css";
import "flexlayout-react/style/dark.css";
import "./layout.css";

import MediaViewer from "./components/MediaViewer.jsx";
import BrowserPanel from "./components/BrowserPanel.jsx";
import ProjectPanel from "./components/ProjectPanel.jsx";
import Panel5 from "./components/Panel5.jsx";
import TerminalPanel from "./components/Terminal.jsx";
import FileManagerPanel from "./components/FileManagerPanel.jsx";
import BlankPanel from "./components/BlankPanel.jsx";

const DEFAULT_JSON = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabEnableDrag: true,
    tabSetEnableMaximize: true,
    tabSetEnableDrop: true,
    tabSetHeaderShown: true,
    tabSetTabStripHeight: 26,
    splitterSize: 6,
    splitterExtra: 4,
  },
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "row", weight: 75,
        children: [
          {
            type: "row", weight: 65,
            children: [
              { type: "tabset", weight: 30, children: [{ type: "tab", name: "Media Viewer", component: "mediaViewer" }] },
              { type: "tabset", weight: 70, children: [{ type: "tab", name: "Browser", component: "panel3", config: { type: "browser", title: "Browser" } }] },
            ],
          },
          {
            type: "tabset", weight: 35,
            children: [
              { type: "tab", name: "Project", component: "projectPanel" },
                { type: "tab", name: "Terminal", component: "terminal", id: "terminal-tab" },
                { type: "tab", name: "File Manager", component: "fileManager", id: "filemanager-tab" },
            ],
          },
        ],
      },
      {
        type: "tabset", weight: 25,
        children: [{ type: "tab", name: "panel5", component: "panel5" }],
      },
    ],
  },
};

const factory = (node) => {
  switch (node.getComponent()) {
    case "mediaViewer":   return <MediaViewer />;
    case "panel3":        return <BrowserPanel config={node.getConfig()} nodeId={node.getId()} />;
    case "projectPanel":  return <ProjectPanel />;
    case "panel5":        return <Panel5 />;
    case "terminal":      return <TerminalPanel />;
    case "fileManager":   return <FileManagerPanel />;
    case "blank":         return <BlankPanel />;
    default:              return null;
  }
};

const App = () => {
  const modelRef = useRef(null);
  const readyRef = useRef(false);
  const [, setTick] = useState(0);

  // Expose layout JSON for main process to grab on close, and model for BrowserPanel to update tabs
  useEffect(() => {
    window.__flexModel = modelRef;
    window.__getLayoutJSON = () => modelRef.current ? modelRef.current.toJson() : null;
    return () => { delete window.__flexModel; delete window.__getLayoutJSON; };
  }, []);

  // Load session → create model → render
  useEffect(() => {
    window.electronAPI.loadSession().then((session) => {
      const json = (session && session.layout) ? JSON.parse(JSON.stringify(session.layout)) : DEFAULT_JSON;
      // Migrate old "panel1" → "mediaViewer" component and "panel1" → "Media Viewer" name
      if (session && session.layout) {
        (function migrate(node) {
          if (node.type === "tab") {
            if (node.component === "panel1") node.component = "mediaViewer";
            if (node.name === "panel1") node.name = "Media Viewer";
          }
          if (node.children) node.children.forEach(migrate);
        })(json);
      }
      modelRef.current = Model.fromJson(json);
      readyRef.current = true;
      setTick((t) => t + 1);
    });
  }, []);

  useEffect(() => {
    const handler = () => { if (modelRef.current) modelRef.current.doAction(Actions.selectTab("terminal-tab")); };
    window.addEventListener("focus-terminal-tab", handler);
    return () => window.removeEventListener("focus-terminal-tab", handler);
  }, []);

  // Reset panels to default layout
  useEffect(() => {
    const unsub = window.electronAPI.onMenuEvent("menu:resetLayout", () => {
      modelRef.current = Model.fromJson(DEFAULT_JSON);
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  if (!readyRef.current) return null;

  return (
    <Layout
      model={modelRef.current}
      factory={factory}
      onRenderTab={(node, renderValues) => {
        const cfg = node.getConfig();
        const isBrowser = cfg?.type === "browser" || node.getComponent() === "panel3";
        if (isBrowser) {
          const title = cfg?.title || "Browser";
          const favicon = cfg?.favicon;
          renderValues.content = (
            <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
              {favicon ? (
                <img src={favicon} width={14} height={14} style={{ flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <svg width={14} height={14} viewBox="0 0 16 16" fill="#888" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7" />
                </svg>
              )}
              <span title={title} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{title.slice(0, 10)}</span>
            </div>
          );
        }
      }}
      onRenderTabSet={(node, renderValues) => {
        renderValues.buttons.push(
          <button key="add" className="flexlayout__tab_toolbar_button"
            onClick={async () => {
              const result = await window.electronAPI.showPanelAddMenu();
              if (!result) return;
              const m = modelRef.current;
              switch (result.action) {
                case "browser":
                  m.doAction(Actions.addNode({
                    type: "tab", component: "panel3", name: "Browser", enableClose: true,
                    config: { type: "browser", title: "Browser" },
                  }, node.getId(), DockLocation.CENTER));
                  break;
                case "terminal":
                  m.doAction(Actions.selectTab("terminal-tab"));
                  window.dispatchEvent(new CustomEvent("focus-terminal-tab"));
                  break;
                case "fileManager":
                  m.doAction(Actions.addNode({
                    type: "tab", component: "fileManager", name: "File Manager", enableClose: true,
                  }, node.getId(), DockLocation.CENTER));
                  break;
                default:
                  if (result.action.startsWith("port:")) {
                    const port = result.action.slice(5);
                    m.doAction(Actions.addNode({
                      type: "tab", component: "panel3", name: `localhost:${port}`, enableClose: true,
                      config: { type: "browser", title: `localhost:${port}`, url: `http://localhost:${port}` },
                    }, node.getId(), DockLocation.CENTER));
                  }
                  break;
              }
            }}
            title="Add Panel"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="#fff">
              <rect x="7" y="1" width="2" height="14" rx="1"/>
              <rect x="1" y="7" width="14" height="2" rx="1"/>
            </svg>
          </button>
        );
      }}
    />
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);