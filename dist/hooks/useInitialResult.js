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
const typeorm_sync_1 = require("typeorm-sync");
const react_1 = require("react");
const LoadingState_1 = require("./LoadingState");
const ErrorType_1 = require("./ErrorType");
function useInitialResult(jsonInitialValue, outdatedAfterSeconds = 30) {
    const [clientError, setClientError] = (0, react_1.useState)();
    const [serverError, setServerError] = (0, react_1.useState)();
    const [isClientLoading, setIsClientLoading] = (0, react_1.useState)(false);
    const [isServerLoading, setIsServerLoading] = (0, react_1.useState)(false);
    const [entities, setEntities] = (0, react_1.useState)(undefined);
    const initialValue = (0, react_1.useMemo)(() => {
        if ('entities' in jsonInitialValue) {
            return typeorm_sync_1.MultipleInitialResult.fromJSON(jsonInitialValue);
        }
        return typeorm_sync_1.SingleInitialResult.fromJSON(jsonInitialValue);
    }, [jsonInitialValue]);
    const [reloadCounter, setReloadCounter] = (0, react_1.useState)(0);
    const saved = (0, react_1.useRef)(false);
    const isOutdated = new Date().getTime() - initialValue.date.getTime() >= outdatedAfterSeconds * 1000;
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
        let isCurrentRequest = true;
        const synchronize = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield typeorm_sync_1.Database.waitForInstance();
                if (!isCurrentRequest) {
                    return;
                }
                const repository = yield (0, typeorm_sync_1.waitForSyncRepository)(initialValue.model);
                if (!isCurrentRequest) {
                    return;
                }
                yield repository.findAndSync(Object.assign(Object.assign({}, initialValue.query), { runOnClient: isOutdated, callback: (foundModels, fromServer) => {
                        if (!isCurrentRequest) {
                            return;
                        }
                        setEntities(foundModels);
                        setIsClientLoading(false);
                        if (fromServer) {
                            setIsServerLoading(false);
                        }
                    }, errorCallback: (error, fromServer) => {
                        if (!isCurrentRequest) {
                            return;
                        }
                        if (fromServer) {
                            setServerError(error);
                            setIsServerLoading(false);
                            setIsClientLoading(false);
                        }
                        else {
                            setClientError(error);
                            setIsClientLoading(false);
                        }
                    } }));
            }
            catch (e) {
                console.error(e);
                if (!isCurrentRequest) {
                    return;
                }
                setServerError(e);
                setIsServerLoading(false);
                setIsClientLoading(false);
            }
        });
        if (isOutdated) {
            setClientError(undefined);
            setServerError(undefined);
            setIsClientLoading(false);
            setIsServerLoading(true);
            synchronize();
        }
        return () => {
            isCurrentRequest = false;
        };
    }, [initialValue.model, initialValue.query, isOutdated, reloadCounter]);
    const reload = (0, react_1.useCallback)(() => setReloadCounter((old) => old + 1), []);
    let resultEntities = entities;
    if (!entities) {
        resultEntities = 'entities' in initialValue ? initialValue.entities : initialValue.entity;
    }
    let loadingState = LoadingState_1.LoadingState.NOTHING;
    if (isServerLoading) {
        loadingState = LoadingState_1.LoadingState.SERVER;
    }
    else if (isClientLoading) {
        loadingState = LoadingState_1.LoadingState.CLIENT;
    }
    let error;
    if (serverError) {
        error = { type: ErrorType_1.ErrorType.SERVER, error: serverError };
    }
    else {
        error = { type: ErrorType_1.ErrorType.CLIENT, error: clientError };
    }
    return [resultEntities, loadingState, error, reload];
}
exports.useInitialResult = useInitialResult;
//# sourceMappingURL=useInitialResult.js.map