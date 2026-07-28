import React from "react";
import ReactDOM from "react-dom/client";
import { Layout, Model, Actions } from "flexlayout-react";
import "flexlayout-react/style/dark.css";
import "./layout.css";

import Panel1 from "./components/Panel1.jsx";
import Panel3 from "./components/Panel3.jsx";
import ProjectPanel from "./components/ProjectPanel.jsx";
import Panel5 from "./components/Panel5.jsx";
import TerminalPanel from "./components/Terminal.jsx";

// ─── FlexLayout JSON Model ────────────────────────────────────────────────────
//
//  Root column
//  ├── Top row  (weight 65)
//  │   ├── Panel1  — left full-height   (weight 22)
//  │   ├── Panel3  — center main area   (weight 53)
//  │   └── Panel5  — right full-height  (weight 25)
//  └── Bottom row  (weight 35)
//      ├── Project Panel  — left + center
//      └── Terminal Panel — left + center
//
const json = {
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
      // ── Left + Center column (stacked: top panels + bottom tabs) ────────
      {
        type: "row",
        weight: 75,
        children: [
          // Top section: Panel1 (left) + Panel3 (center)
          {
            type: "row",
            weight: 65,
            children: [
              // Panel1 — left
              {
                type: "tabset",
                weight: 30,
                children: [{ type: "tab", name: "panel1", component: "panel1" }],
              },
              // Panel3 — center main
              {
                type: "tabset",
                weight: 70,
                children: [{ type: "tab", name: "panel3", component: "panel3" }],
              },
            ],
          },
          // Bottom tabs: Project Panel & Terminal
          {
            type: "tabset",
            weight: 35,
            children: [
              { type: "tab", name: "Project", component: "projectPanel" },
              { type: "tab", name: "Terminal", component: "terminal", id: "terminal-tab" },
            ],
          },
        ],
      },
      // ── Right column — Panel5 full height ────────────────────────────────
      {
        type: "tabset",
        weight: 25,
        children: [{ type: "tab", name: "panel5", component: "panel5" }],
      },
    ],
  },
};

const model = Model.fromJson(json);

// ─── Component factory ───────────────────────────────────────────────────────
const factory = (node) => {
  switch (node.getComponent()) {
    case "panel1":        return <Panel1 />;
    case "panel3":        return <Panel3 />;
    case "projectPanel":  return <ProjectPanel />;
    case "panel5":        return <Panel5 />;
    case "terminal":      return <TerminalPanel />;
    default:              return null;
  }
};

// ─── Root app ────────────────────────────────────────────────────────────────
const App = () => {
  React.useEffect(() => {
    const handler = () => model.doAction(Actions.selectTab("terminal-tab"));
    window.addEventListener("focus-terminal-tab", handler);
    return () => window.removeEventListener("focus-terminal-tab", handler);
  }, []);

  return <Layout model={model} factory={factory} />;
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
