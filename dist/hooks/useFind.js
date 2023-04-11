"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFind = void 0;
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
const react_1 = require("react");
const ErrorType_1 = require("./ErrorType");
const useTypeormSyncCache_1 = require("../store/useTypeormSyncCache");
const useLoadResultFor_1 = require("./useLoadResultFor");
const useQueryId_1 = require("./useQueryId");
// Empty result outside of hook => every time same array
const emptyResult = [];
function useFind(model, options = {}, jsonInitialValueOrDependencies, dependencies = []) {
    var _a;
    const jsonInitialValue = Array.isArray(jsonInitialValueOrDependencies) ? undefined : jsonInitialValueOrDependencies;
    if (Array.isArray(jsonInitialValueOrDependencies)) {
        dependencies = jsonInitialValueOrDependencies;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedOptions = (0, react_1.useMemo)(() => options, dependencies);
    const queryId = (0, useQueryId_1.useQueryId)(model, options);
    const queryData = (0, useTypeormSyncCache_1.useTypeormSyncCache)((state) => { var _a; return (_a = state.queries[queryId]) !== null && _a !== void 0 ? _a : undefined; });
    const { clientError, serverError, loadingState, result: entities } = queryData !== null && queryData !== void 0 ? queryData : {};
    const initialValue = jsonInitialValue ? typeorm_sync_1.MultipleInitialResult.fromJSON(jsonInitialValue) : undefined;
    const loadResult = (0, useLoadResultFor_1.useLoadResultFor)(model, memoizedOptions, !initialValue);
    (0, react_1.useEffect)(() => {
        console.log('LOG-d useFind - loadResult');
        loadResult();
    }, [loadResult]);
    return [
        (_a = entities !== null && entities !== void 0 ? entities : initialValue === null || initialValue === void 0 ? void 0 : initialValue.entities) !== null && _a !== void 0 ? _a : emptyResult,
        loadingState,
        serverError
            ? { type: ErrorType_1.ErrorType.SERVER, error: serverError }
            : clientError
                ? { type: ErrorType_1.ErrorType.CLIENT, error: clientError }
                : undefined,
    ];
}
exports.useFind = useFind;
//# sourceMappingURL=useFind.js.map