// TEMP diagnostics (A7): logs named-customer registration + instantiation.
import { ExtHostCustomersRegistry } from "../../../node_modules/@codingame/monaco-vscode-extensions-service-override/vscode/src/vs/workbench/services/extensions/common/extHostCustomers.js";

const orig = ExtHostCustomersRegistry.getNamedCustomers.bind(ExtHostCustomersRegistry);
ExtHostCustomersRegistry.getNamedCustomers = () => {
  const list = orig();
  console.warn("[diag] registered customers:", list.map(([id]) => id.sid).join(", "));
  return list.map(([id, Ctor]) => {
    const Wrapped = class extends Ctor {
      constructor(...args) {
        console.warn("[diag] instantiating customer:", id.sid);
        try {
          super(...args);
          console.warn("[diag] OK customer:", id.sid);
        } catch (e) {
          console.warn("[diag] FAIL customer:", id.sid, e && e.message);
          throw e;
        }
      }
    };
    return [id, Wrapped];
  });
};
