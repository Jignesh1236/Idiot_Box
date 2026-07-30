import React from "react";

const StatusBar = ({ selectedPath, itemCount, selectedCount, zoom, onZoom }) => {
  const pct = Math.round(zoom);
  return (
    <div className="pw-statusbar">
      <span className="pw-statusbar__path" title={selectedPath || ""}>{selectedPath || ""}</span>
      <span className="pw-statusbar__count">
        {selectedCount > 0
          ? `${selectedCount} selected`
          : itemCount != null
            ? `${itemCount} item${itemCount !== 1 ? "s" : ""}`
            : ""}
      </span>
      <span className="pw-statusbar__zoom">
        <input
          type="range"
          className="pw-zoom-slider"
          min="50"
          max="200"
          step="25"
          value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
          title={`Zoom: ${pct}%`}
        />
        <span className="pw-zoom-label">{pct}%</span>
      </span>
    </div>
  );
};

export default StatusBar;
