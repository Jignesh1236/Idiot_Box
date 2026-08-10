// Real VS Code Extension Host worker.
// Mirrors the upstream entry: vs/workbench/api/worker/extensionHostWorkerMain.js
import { create } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/worker/extensionHostWorker";

const data = create();
self.onmessage = (e) => data.onmessage(e.data);
