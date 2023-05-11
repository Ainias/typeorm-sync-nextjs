"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLoadResultFor = void 0;
const react_1 = require("react");
const useTypeormSyncCache_1 = require("../store/useTypeormSyncCache");
const shallow_1 = require("zustand/shallow");
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
const use_reload_1 = require("@ainias42/use-reload");
const useQueryId_1 = require("./useQueryId");
const getFlatRelationModels_1 = require("../helper/getFlatRelationModels");
function useLoadResultFor(model, options, initialRunOnClient) {
    var _a;
    const queryId = (0, useQueryId_1.useQueryId)(model, options);
    const [initQuery, setQueryResult, setQueryError, setTriggeringEntities, setClientOnlyReload] = (0, useTypeormSyncCache_1.useTypeormSyncCache)((state) => [
        state.initQuery,
        state.setQueryResult,
        state.setQueryError,
        state.setTriggeringEntities,
        state.setClientOnlyReload,
    ], shallow_1.shallow);
    const runOnClient = (0, react_1.useRef)(initialRunOnClient);
    const reload = (0, react_1.useCallback)((clientOnly = false) => __awaiter(this, void 0, void 0, function* () {
        var _b;
        const currentRunOnClient = clientOnly || runOnClient.current;
        runOnClient.current = true;
        // Load directly from store or else loading state is a dependency and then after
        // loading is done, this callback will change and useEffect in useFind and useFindOne
        // will trigger this function again resulting in an endless loop
        const loadingState = (_b = useTypeormSyncCache_1.useTypeormSyncCache.getState().queries[queryId]) === null || _b === void 0 ? void 0 : _b.loadingState;
        if (loadingState) {
            // Is already loading, do nothing
            return;
        }
        console.log('LOG-d reload');
        initQuery(queryId);
        try {
            yield typeorm_sync_1.Database.waitForInstance();
            const repository = yield (0, typeorm_sync_1.waitForSyncRepository)(model);
            yield repository.findAndSync(Object.assign(Object.assign({}, options), { runOnServer: !clientOnly, runOnClient: currentRunOnClient, callback: (foundModels, fromServer) => {
                    // fromServer || clientOnly to set loading state to nothing when clientOnly
                    setQueryResult(queryId, foundModels, fromServer || clientOnly);
                }, errorCallback: (error, fromServer) => {
                    // fromServer || clientOnly to set loading state to nothing when clientOnly
                    setQueryError(queryId, error, fromServer || clientOnly);
                } }));
        }
        catch (e) {
            console.error('Error while Reloading: ', e);
            setQueryError(queryId, e, true);
        }
    }), [initQuery, queryId, model, options, setQueryResult, setQueryError]);
    // Do not have a value for clientOnly
    const reloadableCb = (0, react_1.useCallback)(() => reload(), [reload]);
    const run = (0, react_1.useRef)(0);
    const isClientDb = (_a = typeorm_sync_1.Database.getInstance()) === null || _a === void 0 ? void 0 : _a.isClientDatabase();
    (0, react_1.useMemo)(() => {
        run.current++;
        const currentRun = run.current;
        if (isClientDb) {
            typeorm_sync_1.Database.getInstance()
                .getConnectionPromise()
                .then(() => {
                if (run.current !== currentRun) {
                    return;
                }
                const triggeringModels = (0, getFlatRelationModels_1.getFlatRelationModels)(model, options === null || options === void 0 ? void 0 : options.relations);
                triggeringModels.push(model);
                setTriggeringEntities(queryId, triggeringModels);
            });
        }
    }, [isClientDb, model, options === null || options === void 0 ? void 0 : options.relations, setTriggeringEntities, queryId]);
    (0, react_1.useMemo)(() => {
        setClientOnlyReload(queryId, () => {
            console.log('LOG-d trigger client-only reload');
            return reload(true);
        });
    }, [queryId, reload, setClientOnlyReload]);
    const [reloadFunction] = (0, use_reload_1.useReloadable)(queryId, reloadableCb);
    return reloadFunction;
}
exports.useLoadResultFor = useLoadResultFor;
//# sourceMappingURL=useLoadResultFor.js.map