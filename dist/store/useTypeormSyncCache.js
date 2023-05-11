"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTypeormSyncCache = void 0;
const zustand_1 = require("zustand");
const LoadingState_1 = require("../hooks/LoadingState");
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
const initialState = {
    queries: {},
    triggers: {},
    triggerTimeouts: {},
};
function getInitialQuery() {
    return {
        lastQueryTimestamp: undefined,
        isServerResult: false,
        loadingState: LoadingState_1.LoadingState.NOTHING,
        clientError: undefined,
        serverError: undefined,
        result: undefined,
        backupResult: undefined,
        clientOnlyReload: undefined,
    };
}
const actionsGenerator = (set, get) => ({
    clear() {
        set(Object.assign({}, actionsGenerator(set, get)), true);
    },
    initQuery(id) {
        var _a;
        const { queries } = get();
        const query = Object.assign(Object.assign({}, ((_a = queries[id]) !== null && _a !== void 0 ? _a : getInitialQuery())), { lastQueryTimestamp: new Date().getTime(), loadingState: LoadingState_1.LoadingState.CLIENT_AND_SERVER });
        set({ queries: Object.assign(Object.assign({}, queries), { [id]: query }) });
    },
    setLoadingState(id, loadingState) {
        var _a;
        const { queries } = get();
        const query = Object.assign(Object.assign({}, ((_a = queries[id]) !== null && _a !== void 0 ? _a : getInitialQuery())), { loadingState });
        set({ queries: Object.assign(Object.assign({}, queries), { [id]: query }) });
    },
    setQueryResult(id, result, isServerResult) {
        const { queries } = get();
        const query = queries[id];
        const newQuery = Object.assign(Object.assign({}, (query !== null && query !== void 0 ? query : getInitialQuery())), { loadingState: isServerResult || (query === null || query === void 0 ? void 0 : query.loadingState) === LoadingState_1.LoadingState.NOTHING
                ? LoadingState_1.LoadingState.NOTHING
                : LoadingState_1.LoadingState.SERVER, result, backupResult: typeorm_sync_1.SyncHelper.clone(result), isServerResult });
        set({ queries: Object.assign(Object.assign({}, queries), { [id]: newQuery }) });
    },
    setTriggeringEntities(queryId, models) {
        const { triggers } = get();
        models.forEach((model) => {
            var _a;
            const modelId = typeorm_sync_1.Database.getModelIdFor(model);
            triggers[modelId] = (_a = triggers[modelId]) !== null && _a !== void 0 ? _a : [];
            if (!triggers[modelId].includes(queryId)) {
                triggers[modelId].push(queryId);
            }
        });
    },
    setClientOnlyReload(id, clientOnlyReload) {
        var _a;
        const { queries } = get();
        const query = Object.assign(Object.assign({}, ((_a = queries[id]) !== null && _a !== void 0 ? _a : getInitialQuery())), { clientOnlyReload });
        set({ queries: Object.assign(Object.assign({}, queries), { [id]: query }) });
    },
    trigger(modelId) {
        const { triggers, triggerTimeouts, queries } = get();
        if (triggerTimeouts[modelId]) {
            return;
        }
        const timeout = setTimeout(() => {
            var _a;
            (_a = triggers[modelId]) === null || _a === void 0 ? void 0 : _a.forEach((queryId) => { var _a, _b; return (_b = (_a = queries[queryId]) === null || _a === void 0 ? void 0 : _a.clientOnlyReload) === null || _b === void 0 ? void 0 : _b.call(_a); });
            set((old) => {
                const oldTriggerTimeouts = Object.assign({}, old.triggerTimeouts);
                delete oldTriggerTimeouts[modelId];
                return { triggerTimeouts: oldTriggerTimeouts };
            });
        }, 1000);
        set({ triggerTimeouts: Object.assign(Object.assign({}, triggerTimeouts), { [modelId]: timeout }) });
    },
    setQueryError(id, error, isServerError, restoreBackup = false) {
        const { queries } = get();
        const query = queries[id];
        if (!query) {
            return;
        }
        if (isServerError) {
            query.serverError = error;
            query.loadingState = LoadingState_1.LoadingState.NOTHING;
        }
        else {
            query.clientError = error;
            if (query.loadingState !== LoadingState_1.LoadingState.NOTHING) {
                query.loadingState = LoadingState_1.LoadingState.SERVER;
            }
        }
        if (restoreBackup && query.backupResult) {
            query.result = typeorm_sync_1.SyncHelper.clone(query.backupResult);
        }
        set({ queries: Object.assign(Object.assign({}, queries), { [id]: Object.assign({}, query) }) });
    },
});
exports.useTypeormSyncCache = (0, zustand_1.create)((set, get) => (Object.assign(Object.assign({}, initialState), actionsGenerator(set, get))));
//# sourceMappingURL=useTypeormSyncCache.js.map