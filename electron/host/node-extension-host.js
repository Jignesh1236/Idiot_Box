// Phase B: REAL Node/Desktop Extension Host.
// Runs the real VS Code extension host (monaco-vscode-api extHost code) in a
// Node utility process. Talks the real extension-host protocol (Ready /
// initData / Initialized message handshake) over a MessagePort handed over by
// the main process (MessageChannelMain), with a URI transformer mapping
// extension-file:// locations to the real installed extension folders.
import { createRequire, Module } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { VSBuffer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/buffer';
import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { URITransformer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uriIpc';
import { isMessageOfType, MessageType, createMessageOfType } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtensionHostMain } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extensionHostMain';
import '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.common.services';
import { registerSingleton, InstantiationType } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/extensions';
import { SyncDescriptor } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/descriptors';
import { IExtHostAuthentication, ExtHostAuthentication } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostAuthentication';
import { IExtensionStoragePaths, ExtensionStoragePaths } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostStoragePaths';
import { IExtHostTelemetry, ExtHostTelemetry } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostTelemetry';
import { IExtHostExtensionService, AbstractExtHostExtensionService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostExtensionService';
import { createApiFactoryAndRegisterActors } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.api.impl';
import { RequireInterceptor } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostRequireInterceptor';
import { ExtensionRuntime } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostTypes';
import { timeout } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';

console.log('[node-ext-host] starting, pid', process.pid);

const EXTENSION_FILE_SCHEME = 'extension-file';

// ── Node flavor of the require interceptor: hooks Module._load so extension
//    code can `require('vscode')` (the real VS Code API) while all other
//    requests fall through to the real Node module loader. ────────────────
class NodeRequireInterceptor extends RequireInterceptor {
    _installInterceptor() {
        const originalLoad = Module._load;
        Module._load = (request, parent, isMain) => {
            const result = this._doLoad(request, parent);
            if (result !== undefined) {
                return result;
            }
            return originalLoad.call(Module, request, parent, isMain);
        };
    }
    _doLoad(request, parent) {
        for (const alternativeModuleName of this._alternatives) {
            const alternative = alternativeModuleName(request);
            if (alternative) {
                request = alternative;
                break;
            }
        }
        if (this._factories.has(request)) {
            return this._factories.get(request).load(request, typeof parent === 'string' ? parent : parent?.filename ?? parent, () => {
                throw new Error('CANNOT LOAD MODULE from here.');
            });
        }
        return undefined;
    }
}

// ── Node flavor of the extension host extension service: the real VS Code
//    activation pipeline with the Node entry point (main) and real Node
//    module loading (CommonJS via require, ESM via dynamic import). ───────
class NodeExtHostExtensionService extends AbstractExtHostExtensionService {
    constructor() {
        super(...arguments);
        this.extensionRuntime = ExtensionRuntime.Node;
    }
    async _beforeAlmostReadyToRunExtensions() {
        this._apiFactory = this._instaService.invokeFunction(createApiFactoryAndRegisterActors);
        this._fakeModules = this._instaService.createInstance(NodeRequireInterceptor, this._apiFactory, {
            mine: this._myRegistry,
            all: this._globalRegistry
        });
        await this._fakeModules.install();
        performance.mark('code/extHost/didInitAPI');
        await this._waitForDebuggerAttachment();
    }
    _getEntryPoint(extensionDescription) {
        return extensionDescription.main;
    }
    async _loadCommonJSModule(extension, module, activationTimesBuilder) {
        const modulePath = module.fsPath;
        const _require = createRequire(modulePath);
        try {
            activationTimesBuilder.codeLoadingStart();
            if (extension) {
                await this._extHostLocalizationService.initializeLocalizedMessages(extension);
            }
            return _require(modulePath);
        } finally {
            activationTimesBuilder.codeLoadingStop();
        }
    }
    async _loadESMModule(extension, module, activationTimesBuilder) {
        const modulePath = module.fsPath;
        try {
            activationTimesBuilder.codeLoadingStart();
            if (extension) {
                await this._extHostLocalizationService.initializeLocalizedMessages(extension);
            }
            return await import(pathToFileURL(modulePath).toString());
        } finally {
            activationTimesBuilder.codeLoadingStop();
        }
    }
    async $setRemoteEnvironment(_env) {
        return;
    }
    async _waitForDebuggerAttachment(waitTimeout = 5000) {
        if (!this._initData.environment.isExtensionDevelopmentDebug) {
            return;
        }
        const deadline = Date.now() + waitTimeout;
        while (Date.now() < deadline && !('__jsDebugIsReady' in globalThis)) {
            await timeout(10);
        }
    }
}

registerSingleton(IExtHostAuthentication, ExtHostAuthentication, InstantiationType.Eager);
registerSingleton(IExtHostExtensionService, NodeExtHostExtensionService, InstantiationType.Eager);
registerSingleton(IExtensionStoragePaths, ExtensionStoragePaths, InstantiationType.Eager);
registerSingleton(IExtHostTelemetry, new SyncDescriptor(ExtHostTelemetry, [true], true));

// ── extension-file://<id>/... → file:///<installed dir>/... ───────────────
const extMap = (() => {
    try {
        return JSON.parse(process.env.NODE_EXT_HOST_EXTMAP || '{}');
    } catch {
        return {};
    }
})();
const uriTransformer = new URITransformer({
    transformIncoming(uri) {
        if (uri && uri.scheme === EXTENSION_FILE_SCHEME && typeof uri.authority === 'string') {
            const dir = extMap[uri.authority];
            if (dir) {
                return URI.file(path.join(dir, uri.path));
            }
            console.warn('[node-ext-host] no dir mapping for extension-file authority', uri.authority);
            return uri;
        }
        return uri;
    },
    transformOutgoing(uri) {
        return uri;
    },
    transformOutgoingURI(uri) {
        return uri;
    },
    transformOutgoingScheme(scheme) {
        return scheme;
    }
});

// ── Real extension-host protocol over the MessagePort from the main
//    process. Mirrors the worker host bootstrap (extensionHostWorker.js). ──
const parentPort = process.parentPort;
const emitter = new Emitter();
let terminating = false;
let onTerminate = () => process.exit(0);
let protocolPort = null;
const protocol = {
    onMessage: emitter.event,
    send: vsbuf => {
        if (terminating) {
            return;
        }
        const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
        if (protocolPort) {
            protocolPort.postMessage(data, [data]);
        } else {
            parentPort.postMessage({ __nodeExtHostProtocol: true, data });
        }
    }
};

function connectToRenderer() {
    return new Promise(resolve => {
        const once = protocol.onMessage(raw => {
            once.dispose();
            const initData = JSON.parse(raw.toString());
            protocol.send(createMessageOfType(MessageType.Initialized));
            resolve({ protocol, initData });
        });
        protocol.send(createMessageOfType(MessageType.Ready));
    });
}

parentPort.on('message', event => {
    const data = event.data;
    if (!data || typeof data !== 'object') {
        return;
    }
    if (data.type === 'vscode.init') {
        const port = event.ports && event.ports[0];
        if (port) {
            protocolPort = port;
            port.start && port.start();
            port.on('message', portEvent => {
                const portData = portEvent.data;
                if (!(portData instanceof ArrayBuffer)) {
                    console.warn('[node-ext-host] UNKNOWN data received', portData);
                    return;
                }
                const msg = VSBuffer.wrap(new Uint8Array(portData, 0, portData.byteLength));
                if (isMessageOfType(msg, MessageType.Terminate)) {
                    terminating = true;
                    onTerminate('received terminate message from renderer');
                    return;
                }
                emitter.fire(msg);
            });
        }
        connectToRenderer().then(result => {
            const hostUtil = {
                pid: process.pid,
                exit(code) {
                    process.exit(code);
                }
            };
            const extHostMain = new ExtensionHostMain(result.protocol, result.initData, hostUtil, uriTransformer, new Map());
            onTerminate = reason => extHostMain.terminate(reason);
        }, error => {
            console.error('[node-ext-host] failed to connect to renderer', error);
            process.exit(1);
        });
    }
});
