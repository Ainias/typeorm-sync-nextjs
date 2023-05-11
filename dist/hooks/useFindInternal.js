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
exports.useFindInternal = void 0;
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
const react_1 = require("react");
const isInitialResult_1 = require("../helper/isInitialResult");
const useQueryId_1 = require("./useQueryId");
const useTypeormSyncCache_1 = require("../store/useTypeormSyncCache");
const useLoadResultFor_1 = require("./useLoadResultFor");
const ErrorType_1 = require("./ErrorType");
function useFindInternal(params) {
    var _a, _b, _c;
    const { modelOrInitialResult, findOptionsOrIdOrOptions, dependenciesOrOptions, options, multiple } = params;
    const [initialResult, initialLastQueryTimestamp] = (0, react_1.useMemo)(() => {
        if ((0, isInitialResult_1.isInitialResult)(modelOrInitialResult)) {
            const newInitialResult = multiple
                ? typeorm_sync_1.MultipleInitialResult.fromJSON(modelOrInitialResult)
                : typeorm_sync_1.SingleInitialResult.fromJSON(modelOrInitialResult);
            return [newInitialResult, newInitialResult.isServer ? newInitialResult.date.getTime() : 0];
        }
        return [undefined, 0];
    }, [modelOrInitialResult, multiple]);
    const model = (0, react_1.useMemo)(() => {
        if (initialResult) {
            return initialResult.model;
        }
        return modelOrInitialResult;
    }, [initialResult, modelOrInitialResult]);
    const dependencies = Array.isArray(dependenciesOrOptions) ? dependenciesOrOptions : [];
    const query = (0, react_1.useMemo)(() => {
        console.log('LOG-d recalculate query');
        if (typeof findOptionsOrIdOrOptions === 'function') {
            console.log('LOG-d findOptionsOrIdOrOptions as function');
            return findOptionsOrIdOrOptions();
        }
        if (typeof findOptionsOrIdOrOptions === 'number') {
            return { id: findOptionsOrIdOrOptions };
        }
        if (findOptionsOrIdOrOptions && !('outdatedAfter' in findOptionsOrIdOrOptions)) {
            return findOptionsOrIdOrOptions;
        }
        if (initialResult) {
            return initialResult.query;
        }
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelOrInitialResult, ...dependencies]);
    const { outdatedAfter = 30 } = options !== null && options !== void 0 ? options : (dependenciesOrOptions && !Array.isArray(dependenciesOrOptions)
        ? dependenciesOrOptions
        : typeof findOptionsOrIdOrOptions === 'object' && 'outdatedAfter' in findOptionsOrIdOrOptions
            ? findOptionsOrIdOrOptions
            : {});
    const queryId = (0, useQueryId_1.useQueryId)(model, query);
    const queryData = (0, useTypeormSyncCache_1.useTypeormSyncCache)((state) => { var _a; return (_a = state.queries[queryId]) !== null && _a !== void 0 ? _a : undefined; });
    const setQueryResult = (0, useTypeormSyncCache_1.useTypeormSyncCache)((state) => state.setQueryResult);
    const saved = (0, react_1.useRef)(false);
    const lastQueryTimestamp = (_a = queryData === null || queryData === void 0 ? void 0 : queryData.lastQueryTimestamp) !== null && _a !== void 0 ? _a : initialLastQueryTimestamp;
    const isOutdated = new Date().getTime() - lastQueryTimestamp >= outdatedAfter * 1000;
    const loadResult = (0, useLoadResultFor_1.useLoadResultFor)(model, query, !initialResult);
    (0, react_1.useEffect)(() => {
        if (!saved.current && !isOutdated && initialResult) {
            saved.current = true;
            typeorm_sync_1.Database.waitForInstance()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const repository = yield (0, typeorm_sync_1.waitForSyncRepository)(initialResult.model);
                yield repository.saveInitialResult(initialResult);
            }))
                .catch((e) => console.error('useFindInternal - Error - saveResult: ', e));
            setQueryResult(queryId, 'entities' in initialResult ? initialResult.entities : [initialResult.entity], initialResult.isServer);
        }
    }, [initialResult, isOutdated, queryId, setQueryResult]);
    (0, react_1.useEffect)(() => {
        if (isOutdated) {
            loadResult();
        }
    }, [isOutdated, loadResult]);
    const { clientError, serverError, loadingState, result: entities } = queryData !== null && queryData !== void 0 ? queryData : {};
    const resultEntities = ((_c = (_b = (multiple ? entities : entities === null || entities === void 0 ? void 0 : entities[0])) !== null && _b !== void 0 ? _b : initialResult === null || initialResult === void 0 ? void 0 : initialResult[(multiple ? 'entities' : 'entity')]) !== null && _c !== void 0 ? _c : null);
    let error;
    if (serverError) {
        error = { type: ErrorType_1.ErrorType.SERVER, error: serverError };
    }
    else if (clientError) {
        error = { type: ErrorType_1.ErrorType.CLIENT, error: clientError };
    }
    return [resultEntities, loadingState, error, loadResult, { model, queryId }];
}
exports.useFindInternal = useFindInternal;
//# sourceMappingURL=useFindInternal.js.map