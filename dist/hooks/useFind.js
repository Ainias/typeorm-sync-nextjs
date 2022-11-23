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
exports.useFind = void 0;
const typeorm_sync_1 = require("typeorm-sync");
const react_1 = require("react");
const LoadingState_1 = require("./LoadingState");
const ErrorType_1 = require("./ErrorType");
// Empty result outside of hook => every time same array
const emptyResult = [];
function useFind(model, options = {}, jsonInitialValue, dependencies = []) {
    var _a;
    const [clientError, setClientError] = (0, react_1.useState)();
    const [serverError, setServerError] = (0, react_1.useState)();
    const [isClientLoading, setIsClientLoading] = (0, react_1.useState)(false);
    const [isServerLoading, setIsServerLoading] = (0, react_1.useState)(false);
    const [entities, setEntities] = (0, react_1.useState)(undefined);
    const initialValue = jsonInitialValue ? typeorm_sync_1.MultipleInitialResult.fromJSON(jsonInitialValue) : undefined;
    const [runOnClient] = (0, react_1.useState)(initialValue === undefined);
    (0, react_1.useEffect)(() => {
        let isCurrentRequest = true;
        setClientError(undefined);
        setServerError(undefined);
        setIsClientLoading(false);
        setIsServerLoading(true);
        console.log('LOG-d useFindEffect');
        // queryServer(model, options)
        //     .then((result) => {
        //         if (isCurrentRequest) {
        //             setEntities(result);
        //             setIsServerLoading(false);
        //         }
        //     })
        //     .catch((e) => {
        //         setServerError(e);
        //         setIsServerLoading(false);
        //     });
        typeorm_sync_1.Database.waitForInstance()
            .then(() => __awaiter(this, void 0, void 0, function* () {
            console.log('wait for instance');
            if (!isCurrentRequest) {
                return;
            }
            const repository = yield (0, typeorm_sync_1.waitForSyncRepository)(model);
            console.log('got repository', repository);
            yield repository.findAndSync(Object.assign(Object.assign({}, options), { runOnClient, callback: (foundModels, fromServer) => {
                    console.log('LOG-d got results', foundModels, fromServer);
                    if (isCurrentRequest) {
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
        }))
            .catch((e) => {
            console.error(e);
            if (!isCurrentRequest) {
                return;
            }
            setServerError(e);
            setIsServerLoading(false);
            setIsClientLoading(false);
        });
        return () => {
            isCurrentRequest = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model, runOnClient, ...dependencies]);
    return [
        (_a = entities !== null && entities !== void 0 ? entities : initialValue === null || initialValue === void 0 ? void 0 : initialValue.entities) !== null && _a !== void 0 ? _a : emptyResult,
        isServerLoading ? LoadingState_1.LoadingState.SERVER : isClientLoading ? LoadingState_1.LoadingState.CLIENT : LoadingState_1.LoadingState.NOTHING,
        serverError
            ? { type: ErrorType_1.ErrorType.SERVER, error: serverError }
            : clientError
                ? { type: ErrorType_1.ErrorType.CLIENT, error: clientError }
                : undefined,
    ];
}
exports.useFind = useFind;
//# sourceMappingURL=useFind.js.map