// Phase B: LocalProcess extension host running in the REAL Node/Desktop
// extension host process (electron/host/node-extension-host.js). Registered
// via setLocalExtensionHost() from the extensions service override, so the
// extension service creates THIS host when an extension's running location is
// LocalProcess. Talks the real extension-host protocol (Ready / initData /
// Initialized handshake) over a MessagePort provided by the main process.
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Barrier } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';
import { VSBuffer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/buffer';
import { Emitter, Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { joinPath } from '@codingame/monaco-vscode-api/vscode/vs/base/common/resources';
import { language } from '@codingame/monaco-vscode-api/vscode/vs/base/common/platform';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { ILabelService } from '@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service';
import { ILogService, ILoggerService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { IProductService } from '@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service';
import { ITelemetryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service';
import { isLoggingOnly } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetryUtils';
import { IUserDataProfilesService } from '@codingame/monaco-vscode-api/vscode/vs/platform/userDataProfile/common/userDataProfile.service';
import { WorkbenchState } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace';
import { IWorkspaceContextService } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service';
import { IBrowserWorkbenchEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service';
import { IDefaultLogLevelsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/log/common/defaultLogLevels.service';
import { ExtensionHostExitCode, isMessageOfType, MessageType, createMessageOfType, UIKind } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtensionHostStartup } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions';

let NodeLocalProcessExtensionHost = class NodeLocalProcessExtensionHost extends Disposable {    constructor(
        runningLocation,
        startup,
        _initDataProvider,
        _telemetryService,
        _contextService,
        _labelService,
        _logService,
        _loggerService,
        _environmentService,
        _userDataProfilesService,
        _productService,
        _defaultLogLevelsService
    ) {
        super();
        this.runningLocation = runningLocation;
        this.startup = startup;
        this._initDataProvider = _initDataProvider;
        this._telemetryService = _telemetryService;
        this._contextService = _contextService;
        this._labelService = _labelService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._environmentService = _environmentService;
        this._userDataProfilesService = _userDataProfilesService;
        this._productService = _productService;
        this._defaultLogLevelsService = _defaultLogLevelsService;
        this.pid = null;
        this.remoteAuthority = null;
        this.extensions = null;
        this._onDidExit = this._register(new Emitter());
        this.onExit = this._onDidExit.event;
        this._isTerminating = false;
        this._protocolPromise = null;
        this._protocol = null;
        this._port = null;
        this._extensionHostLogsLocation = joinPath(this._environmentService.extHostLogsPath, 'localProcess');
    }
    async start() {
        if (!this._protocolPromise) {
            this._protocolPromise = this._start();
            this._protocolPromise.then(protocol => this._protocol = protocol);
        }
        return this._protocolPromise;
    }
    async _start() {
        const spawned = await window.electronAPI.nodeExtHostSpawn(nodeExtMap);
        if (!spawned || !spawned.port) {
            throw new Error('Failed to spawn the Node/Desktop extension host process');
        }
        const port = spawned.port;
        this._port = port;
        this.pid = spawned.pid ?? null;
        const emitter = this._register(new Emitter());
        port.onmessage = event => {
            const { data } = event;
            if (!(data instanceof ArrayBuffer)) {
                console.warn('UNKNOWN data received', data);
                this._onDidExit.fire([ExtensionHostExitCode.UnexpectedError, 'UNKNOWN data received']);
                return;
            }
            const msg = VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength));
            if (isMessageOfType(msg, MessageType.Terminate)) {
                this._onDidExit.fire([ExtensionHostExitCode.UnexpectedError, 'Node extension host terminated']);
                return;
            }
            emitter.fire(msg);
        };
        const protocol = {
            onMessage: emitter.event,
            send: vsbuf => {
                const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                port.postMessage(data, [data]);
            }
        };
        const result = await this._performHandshake(protocol);
        return result;
    }
    async _performHandshake(protocol) {
        await Event.toPromise(Event.filter(protocol.onMessage, msg => isMessageOfType(msg, MessageType.Ready)));
        if (this._isTerminating) {
            throw new Error('Extension host is terminating');
        }
        protocol.send(VSBuffer.fromString(JSON.stringify(await this._createExtHostInitData())));
        if (this._isTerminating) {
            throw new Error('Extension host is terminating');
        }
        await Event.toPromise(Event.filter(protocol.onMessage, msg => isMessageOfType(msg, MessageType.Initialized)));
        if (this._isTerminating) {
            throw new Error('Extension host is terminating');
        }
        return protocol;
    }
    dispose() {
        if (this._isTerminating) {
            return;
        }
        this._isTerminating = true;
        this._protocol?.send(createMessageOfType(MessageType.Terminate));
        if (this._port) {
            try { this._port.close(); } catch { }
        }
        super.dispose();
    }
    getInspectPort() {
        return undefined;
    }
    enableInspectPort() {
        return Promise.resolve(false);
    }
    async _createExtHostInitData() {
        const initData = await this._initDataProvider.getInitData();
        this.extensions = initData.extensions;
        const workspace = this._contextService.getWorkspace();
        const nlsBaseUrl = this._productService.extensionsGallery?.nlsBaseUrl;
        let nlsUrlWithDetails = undefined;
        if (nlsBaseUrl && this._productService.commit) {
            nlsUrlWithDetails = URI.joinPath(URI.parse(nlsBaseUrl), this._productService.commit, this._productService.version, language);
        }
        return {
            commit: this._productService.commit,
            version: this._productService.version,
            quality: this._productService.quality,
            date: this._productService.date,
            parentPid: 0,
            environment: {
                isExtensionDevelopmentDebug: this._environmentService.debugRenderer,
                appName: this._productService.nameLong,
                appHost: 'desktop',
                appUriScheme: this._productService.urlProtocol,
                appLanguage: this._productService.language,
                isExtensionTelemetryLoggingOnly: isLoggingOnly(this._productService, this._environmentService),
                isPortable: false,
                extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                workspaceStorageHome: this._environmentService.workspaceStorageHome,
                extensionLogLevel: this._defaultLogLevelsService.defaultLogLevels.extensions,
                isSessionsWindow: this._environmentService.isSessionsWindow
            },
            workspace: this._contextService.getWorkbenchState() === WorkbenchState.EMPTY ? undefined : {
                configuration: workspace.configuration || undefined,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            },
            consoleForward: {
                includeStack: false,
                logNative: this._environmentService.debugRenderer
            },
            extensions: this.extensions.toSnapshot(),
            nlsBaseUrl: nlsUrlWithDetails,
            telemetryInfo: {
                sessionId: this._telemetryService.sessionId,
                machineId: this._telemetryService.machineId,
                sqmId: this._telemetryService.sqmId,
                devDeviceId: this._telemetryService.devDeviceId ?? this._telemetryService.machineId,
                firstSessionDate: this._telemetryService.firstSessionDate,
                msftInternal: this._telemetryService.msftInternal
            },
            remoteExtensionTips: this._productService.remoteExtensionTips,
            virtualWorkspaceExtensionTips: this._productService.virtualWorkspaceExtensionTips,
            logLevel: this._logService.getLevel(),
            loggers: [...this._loggerService.getRegisteredLoggers()],
            logsLocation: this._extensionHostLogsLocation,
            autoStart: (this.startup === ExtensionHostStartup.EagerAutoStart || this.startup === ExtensionHostStartup.LazyAutoStart),
            remote: {
                authority: this._environmentService.remoteAuthority,
                connectionData: null,
                isRemote: false
            },
            uiKind: UIKind.Desktop
        };
    }
};
NodeLocalProcessExtensionHost = __decorate([
    __param(3, ITelemetryService),
    __param(4, IWorkspaceContextService),
    __param(5, ILabelService),
    __param(6, ILogService),
    __param(7, ILoggerService),
    __param(8, IBrowserWorkbenchEnvironmentService),
    __param(9, IUserDataProfilesService),
    __param(10, IProductService),
    __param(11, IDefaultLogLevelsService)
], NodeLocalProcessExtensionHost);

// extension-file://<id> -> installed dir, provided by bootstrap.js
let nodeExtMap = {};
function setNodeExtHostMap(map) {
    nodeExtMap = map || {};
}

export { NodeLocalProcessExtensionHost, setNodeExtHostMap };
