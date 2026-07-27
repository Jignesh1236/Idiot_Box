import { useState, useEffect, useCallback } from "react";

// ─── useSettings ─────────────────────────────────────────────────────────────
// Shared hook for reading/writing persistent application settings.
// Usage:
//   const [settings, updateSettings, loading] = useSettings();
//   updateSettings({ defaultEditor: "vscode" });
// ─────────────────────────────────────────────────────────────────────────────

const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    window.electronAPI.readSettings().then((data) => {
      setSettings(data ?? {});
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await window.electronAPI.writeSettings(next);
    return next;
  }, [settings]);

  return [settings, updateSettings, loading];
};

export default useSettings;
