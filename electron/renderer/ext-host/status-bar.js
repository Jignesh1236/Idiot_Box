// A7 — REAL status bar integration adapter.
//
// Implements the workbench IStatusbarService contract (the real service the
// real ExtensionStatusBarItemService is injected with) backed by the existing
// app footer. Extensions drive it through the real pipeline:
//
//   vscode.window.createStatusBarItem() → ExtHostStatusBar (worker)
//     → MainThreadStatusBar (main) → IExtensionStatusBarItemService
//     → IStatusbarService.addEntry(...)  ← this module
//
// No custom StatusBarItem API is created; this is the "IDE integration
// adapter" that renders real workbench status-bar entries into the footer.
// Updates reach the DOM through the real accessor ({ update, dispose })
// returned by addEntry — there is no update event, so this service IS the
// renderer, exactly like the real VS Code Statusbar widget.
import { getService } from "@codingame/monaco-vscode-api";
import { IStatusbarService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/statusbar/browser/statusbar.service";
import { StatusbarAlignment } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/statusbar/browser/statusbar";
import { ICommandService } from "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service";
import { Emitter } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { registerSingleton, InstantiationType } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/extensions";
import { IExtensionStatusBarItemService, StatusBarUpdateKind } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/browser/statusBarService";
import { __decorate, __param } from "@codingame/monaco-vscode-api/external/tslib/tslib.es6";

const LEFT_ID = "pw-hostbar-left";
const RIGHT_ID = "pw-hostbar-right";
const CHANGED_EVENT = "pw:hostbar-changed";

console.warn("[statusbar] module loaded, registering IStatusbarService");

function injectStyle() {
  if (document.getElementById("pw-statusbar-style")) return;
  const style = document.createElement("style");
  style.id = "pw-statusbar-style";
  style.textContent = `
.pw-statusbar-item {
  display: inline-flex; align-items: center; gap: 4px;
  height: 20px; padding: 0 6px; border-radius: 3px;
  background: transparent; white-space: nowrap; overflow: hidden;
}
.pw-statusbar-item:hover {
  background: var(--vscode-statusBarItem-hoverBackground, rgba(255, 255, 255, 0.12));
}
.pw-statusbar-item .codicon { font-size: 12px; line-height: 1; }
`;
  document.head.appendChild(style);
}

const stripMarkdown = (text) =>
  String(text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~#>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function tooltipToText(tooltip) {
  if (tooltip == null) return undefined;
  if (typeof tooltip === "string") return tooltip;
  if (typeof tooltip.markdown === "function") {
    return tooltip.markdownNotSupportedFallback || undefined;
  }
  const md = tooltip.markdown;
  if (md && typeof md === "object" && typeof md.value === "string") return stripMarkdown(md.value);
  if (typeof tooltip.value === "string") return stripMarkdown(tooltip.value);
  return undefined;
}

function resolveCommand(command) {
  if (!command) return null;
  if (typeof command === "string") return { id: command, args: [] };
  if (typeof command === "object" && typeof command.id === "string") {
    return { id: command.id, args: Array.isArray(command.arguments) ? command.arguments : [] };
  }
  return null;
}

const resolveColor = (color) =>
  typeof color === "object" && color && typeof color.id === "string"
    ? `var(--vscode-${color.id})`
    : typeof color === "string"
      ? color
      : undefined;

function renderText(container, text) {
  const parts = String(text || "").split(/\$\(([\w\-~]+)\)/g);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) container.appendChild(document.createTextNode(parts[i]));
    } else {
      const [icon, ...mods] = parts[i].split("~");
      const el = document.createElement("span");
      el.className = "codicon codicon-" + icon + mods.map((m) => " codicon-modifier-" + m).join("");
      container.appendChild(el);
    }
  }
}

class FooterStatusbarService {
  constructor() {
    console.warn("[statusbar] FooterStatusbarService instantiated (host connect)");
    this._entries = new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    injectStyle();
  }

  addEntry(entry, id, alignment, priority) {
    console.warn("[statusbar:addEntry]", id, JSON.stringify({ text: entry.text, tooltip: entry.tooltip, cmd: entry.command, kind: entry.kind }), "align:", alignment, "prio:", priority);
    const primary = typeof priority === "object" ? priority.primary : priority;
    const secondary = typeof priority === "object" ? priority.secondary : 0;
    const rec = { id, entry, alignment, priority: primary || 0, secondary: secondary || 0 };
    this._entries.set(id, rec);
    this._reflow();
    this._notify();
    return {
      update: (newEntry) => {
        rec.entry = newEntry;
        this._reflow();
      },
      dispose: () => {
        if (this._entries.delete(id)) {
          this._reflow();
          this._notify();
        }
      },
    };
  }

  getEntries() {
    return this._entries.entries();
  }

  isEntryVisible() {
    return true;
  }

  updateEntryVisibility() {}

  focus() {}

  focusNextEntry() {}

  focusPreviousEntry() {}

  dispose() {
    this._entries.clear();
    this._onDidChange.dispose();
  }

  _buildItem(rec) {
    const { entry } = rec;
    const el = document.createElement("span");
    el.className = "pw-statusbar-item";
    el.dataset.entryId = rec.id;

    const tooltip = tooltipToText(entry.tooltip);
    if (tooltip) el.title = tooltip;

    const label = entry.ariaLabel || (typeof entry.text === "string" ? stripMarkdown(entry.text) : undefined);
    if (label) el.setAttribute("aria-label", label);

    const cmd = resolveCommand(entry.command);
    if (entry.role) el.setAttribute("role", entry.role);
    else if (cmd) el.setAttribute("role", "button");
    if (cmd) el.setAttribute("tabindex", "0");

    if (entry.kind === "error") el.style.background = "var(--vscode-statusBarItem-errorBackground, #be1100)";
    else if (entry.kind === "warning") el.style.background = "var(--vscode-statusBarItem-warningBackground, #895503)";
    else if (entry.backgroundColor) el.style.background = resolveColor(entry.backgroundColor) || entry.backgroundColor;
    if (entry.color) el.style.color = resolveColor(entry.color) || entry.color;

    if (cmd) {
      el.style.cursor = "pointer";
      const run = () => this._runCommand(cmd);
      el.addEventListener("click", run);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          run();
        }
      });
    }

    renderText(el, entry.text);
    return el;
  }

  _runCommand(cmd) {
    getService(ICommandService)
      .then((commandService) => commandService.executeCommand(cmd.id, ...cmd.args))
      .catch((err) => console.warn("[statusbar] command failed:", cmd.id, err));
  }

  _reflow() {
    const left = document.getElementById(LEFT_ID);
    const right = document.getElementById(RIGHT_ID);
    if (!left || !right) {
      // Footer is hidden by React (or not committed yet); retry until the
      // containers exist, then render.
      if (this._retryTimer) clearTimeout(this._retryTimer);
      this._retryTimer = setTimeout(() => this._reflow(), 50);
      return;
    }
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
      this._retryTimer = null;
    }
    left.textContent = "";
    right.textContent = "";
    const leftItems = [];
    const rightItems = [];
    for (const [, rec] of this._entries) {
      if (rec.alignment === StatusbarAlignment.LEFT) leftItems.push(rec);
      else rightItems.push(rec);
    }
    leftItems.sort((a, b) => b.priority - a.priority || b.secondary - a.secondary);
    rightItems.sort((a, b) => a.priority - b.priority || a.secondary - b.secondary);
    for (const rec of leftItems) left.appendChild(this._buildItem(rec));
    for (const rec of rightItems) right.appendChild(this._buildItem(rec));
  }

  _notify() {
    window.dispatchEvent(
      new CustomEvent(CHANGED_EVENT, { detail: { count: this._entries.size } })
    );
    // React hides/shows the footer conditionally; re-render once the
    // containers exist again after the visibility state settles.
    requestAnimationFrame(() => this._reflow());
  }
}

registerSingleton(IStatusbarService, FooterStatusbarService, InstantiationType.Delayed);

// Real IExtensionStatusBarItemService contract (what MainThreadStatusBar and
// the statusBarItems extension point are injected with). The api's real
// implementation and a standalone stub are registered elsewhere; this module
// evaluates last, so this registration wins in the ServiceCollection.
class FooterExtensionStatusBarItemService {
  constructor(_statusbarService) {
    this._statusbarService = _statusbarService;
    this._entries = new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    console.warn("[statusbar] FooterExtensionStatusBarItemService instantiated");
  }

  setOrUpdateEntry(
    entryId,
    id,
    extensionId,
    name,
    text,
    tooltip,
    command,
    color,
    backgroundColor,
    alignLeft,
    priority,
    accessibilityInformation
  ) {
    const entry = {
      id,
      extensionId,
      name,
      text,
      tooltip,
      command,
      color,
      backgroundColor,
      ariaLabel: accessibilityInformation ? accessibilityInformation.label : undefined,
      role: accessibilityInformation ? accessibilityInformation.role : undefined,
    };
    const alignment = alignLeft ? StatusbarAlignment.LEFT : StatusbarAlignment.RIGHT;
    const prio = priority ?? 0;
    const existing = this._entries.get(entryId);
    if (!existing) {
      const accessor = this._statusbarService.addEntry(entry, entryId, alignment, prio);
      this._entries.set(entryId, { entry, alignment, priority: prio, accessor });
      this._onDidChange.fire({ added: [entryId, { entry, alignment, priority: prio }] });
      return StatusBarUpdateKind.DidDefine;
    }
    existing.accessor.update(entry);
    existing.entry = entry;
    this._onDidChange.fire({ added: [entryId, { entry, alignment: existing.alignment, priority: existing.priority }] });
    return StatusBarUpdateKind.DidUpdate;
  }

  unsetEntry(entryId) {
    const existing = this._entries.get(entryId);
    if (!existing) return;
    this._entries.delete(entryId);
    existing.accessor.dispose();
    this._onDidChange.fire({ removed: entryId });
  }

  getEntries() {
    return this._entries.entries();
  }
}

FooterExtensionStatusBarItemService = __decorate(
  [__param(0, IStatusbarService)],
  FooterExtensionStatusBarItemService
);
registerSingleton(
  IExtensionStatusBarItemService,
  FooterExtensionStatusBarItemService,
  InstantiationType.Delayed
);

export { FooterStatusbarService, FooterExtensionStatusBarItemService };
