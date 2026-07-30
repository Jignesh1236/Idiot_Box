import React, { useState, useEffect } from "react";

const FileManagerPanel = () => {
  const [FM, setFM] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    import("@cubone/react-file-manager")
      .then((mod) => {
        if (!mounted) return;
        // Try several common export shapes
        const Comp = mod.default || mod.FileManager || mod.ReactFileManager || mod;
        setFM(() => Comp);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Failed to load @cubone/react-file-manager:", err);
        setError(err?.message || String(err));
      });
    return () => { mounted = false; };
  }, []);

  if (error) return <div style={{ padding: 12 }}>File Manager failed to load: {error}</div>;
  if (!FM) return <div style={{ padding: 12 }}>Loading File Manager (install dependencies and rebuild if this hangs)...</div>;

  // Render the package's default component. Provide a full-height container.
  const FMComp = FM;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <FMComp />
      </div>
    </div>
  );
};

export default FileManagerPanel;
