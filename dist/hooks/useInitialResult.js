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
exports.useInitialResult = void 0;
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
const react_1 = require("react");
const ErrorType_1 = require("./ErrorType");
const useTypeormSyncCache_1 = require("../store/useTypeormSyncCache");
const useLoadResultFor_1 = require("./useLoadResultFor");
const useQueryId_1 = require("./useQueryId");
function useInitialResult(jsonInitialValue, outdatedAfterSeconds = 30) {
    var _a;
    const initialValue = (0, react_1.useMemo)(() => {
        if ('entities' in jsonInitialValue) {
            return typeorm_sync_1.MultipleInitialResult.fromJSON(jsonInitialValue);
        }
        return typeorm_sync_1.SingleInitialResult.fromJSON(jsonInitialValue);
    }, [jsonInitialValue]);
    const queryId = (0, useQueryId_1.useQueryId)(initialValue.model, initialValue.query);
    const queryData = (0, useTypeormSyncCache_1.useTypeormSyncCache)((state) => { var _a; return (_a = state.queries[queryId]) !== null && _a !== void 0 ? _a : undefined; });
    const { clientError, serverError, loadingState, result: entities } = queryData !== null && queryData !== void 0 ? queryData : {};
    const saved = (0, react_1.useRef)(false);
    const lastQueryTimestamp = ((_a = queryData === null || queryData === void 0 ? void 0 : queryData.lastQueryTimestamp) !== null && _a !== void 0 ? _a : initialValue.isServer) ? initialValue.date.getTime() : 0;
    const isOutdated = new Date().getTime() - lastQueryTimestamp >= outdatedAfterSeconds * 1000;
    const loadResult = (0, useLoadResultFor_1.useLoadResultFor)(initialValue.model, initialValue.query, false);
    (0, react_1.useEffect)(() => {
        if (!saved.current && !isOutdated) {
            saved.current = true;
            typeorm_sync_1.Database.waitForInstance()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const repository = yield (0, typeorm_sync_1.waitForSyncRepository)(initialValue.model);
                yield repository.saveInitialResult(initialValue);
            }))
                .catch((e) => console.error('useInitialResult-Error - saveResult: ', e));
        }
    }, [initialValue, isOutdated]);
    (0, react_1.useEffect)(() => {
        if (isOutdated) {
            loadResult();
        }
    }, [isOutdated, loadResult]);
    let resultEntities = entities;
    if (!entities) {
        resultEntities = 'entities' in initialValue ? initialValue.entities : initialValue.entity;
    }
    let error;
    if (serverError) {
        error = { type: ErrorType_1.ErrorType.SERVER, error: serverError };
    }
    else {
        error = { type: ErrorType_1.ErrorType.CLIENT, error: clientError };
    }
    return [resultEntities, loadingState, error, loadResult];
}
exports.useInitialResult = useInitialResult;
//# sourceMappingURL=useInitialResult.js.map