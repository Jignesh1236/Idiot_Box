// Integration adapters plugging the REAL VS Code Extension Host stack into this
// app. Everything here reuses the upstream protocol classes unchanged:
//   - the worker runs the real extensionHostWorkerMain entry (ext-host.worker.js)
//   - the handshake (Ready -> initData JSON -> Initialized) is _performHandshake
//   - ExtensionHostMain + all ExtHost*/MainThread* actors are upstream code.
// Only the transport bootstrap differs: upstream loads the host through an
// iframe (vscode.dev style); here we talk to the worker directly over a
// MessageChannel (same ExtensionWorker protocol, same messages).
import { Emitter } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { Barrier } from "@codingame/monaco-vscode-api/vscode/vs/base/common/async";
import { VSBuffer } from "@codingame/monaco-vscode-api/vscode/vs/base/common/buffer";
import { ExtensionHostExitCode } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol";
import { WebWorkerExtensionHost } from "@codingame/monaco-vscode-extensions-service-override/vscode/vs/workbench/services/extensions/browser/webWorkerExtensionHost";
import { setLocalExtensionHost } from "@codingame/monaco-vscode-extensions-service-override";

const EXT_HOST_WORKER_URL = "./ext-host.worker.js";

// Replace only the iframe bootstrap of the real WebWorkerExtensionHost with a
// direct worker + MessagePort transport. The class identity, start()/dispose()
// lifecycle, _performHandshake and _createExtHostInitData stay 100% upstream.
export function installWebWorkerHostTransport() {
  WebWorkerExtensionHost.prototype._startInsideIframe = function () {
    return startDirectWorkerTransport(this);
  };
}

async function startDirectWorkerTransport(host) {
  const emitter = host._register(new Emitter());
  const worker = new Worker(EXT_HOST_WORKER_URL);
  const barrier = new Barrier();
  let port = null;

  worker.onmessage = (event) => {
    const { data } = event;
    if (data instanceof MessagePort) {
      port = data;
      barrier.open();
    } else {
      console.warn("[ext-host] unknown message from extension host worker", data);
    }
  };
  worker.onerror = (event) => {
    const err = new Error(event?.message || "Extension host worker error");
    host._onDidExit.fire([ExtensionHostExitCode.UnexpectedError, err.message]);
    barrier.open();
  };
  host._register({ dispose: () => worker.terminate() });

  await barrier.wait();
  if (!port) {
    throw new Error("Extension host worker did not provide a message port");
  }

  port.onmessage = (event) => {
    const { data } = event;
    if (!(data instanceof ArrayBuffer)) {
      console.warn("[ext-host] unknown data received", data);
      host._onDidExit.fire([77, "UNKNOWN data received"]);
      return;
    }
    emitter.fire(VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength)));
  };

  const protocol = {
    onMessage: emitter.event,
    send: (vsbuf) => {
      const data = vsbuf.buffer.buffer.slice(
        vsbuf.buffer.byteOffset,
        vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength
      );
      port.postMessage(data, [data]);
    },
  };

  worker.postMessage({ type: "vscode.init", data: new Map() });
  return host._performHandshake(protocol);
}

// Official hook of the extensions service override: supplies the host class for
// the LocalProcess running location (used in Phase B for desktop extensions).
export function installLocalProcessHost(hostClass) {
  setLocalExtensionHost(hostClass);
}
