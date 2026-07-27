import React from "react";

const StatusBar = ({ selectedPath, itemCount, selectedCount }) => (
  <div className="pw-statusbar">
    <span className="pw-statusbar__path" title={selectedPath || ""}>{selectedPath || ""}</span>
    <span className="pw-statusbar__count">
      {selectedCount > 0
        ? `${selectedCount} selected`
        : itemCount != null
          ? `${itemCount} item${itemCount !== 1 ? "s" : ""}`
          : ""}
    </span>
  </div>
);

export default StatusBar;
