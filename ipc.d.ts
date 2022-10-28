declare type Callback = (payload?: any, event?: string) => void;
declare function ipcInit(port: string): {
    on: (event: string, callback: Callback) => void | (() => void);
    once: (event: string, callback: Callback) => () => void;
    registerEvent: (event: string, callback: Callback, type: "on" | "once") => () => void;
    emit: (event: string, payload?: any) => void;
    onEvents: Map<string, Callback[]>;
    onceEvents: Map<string, Callback[]>;
};
export default ipcInit;
//# sourceMappingURL=ipc.d.ts.map