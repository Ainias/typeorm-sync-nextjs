"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFind = void 0;
const typeorm_sync_1 = require("typeorm-sync");
const react_1 = require("react");
const LoadingState_1 = require("./LoadingState");
const ErrorType_1 = require("./ErrorType");
const queryServer_1 = require("../helper/queryServer");
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
        console.log('LOG-d options', options);
        (0, queryServer_1.queryServer)(model, options)
            .then((result) => {
            if (isCurrentRequest) {
                setEntities(result);
                setIsServerLoading(false);
            }
        })
            .catch((e) => {
            setServerError(e);
            setIsServerLoading(false);
        });
        // Database.waitForInstance().then(async () => {
        //     if (!isCurrentRequest) {
        //         return;
        //     }
        //
        //     const repository = await waitForSyncRepository(model);
        //     repository.findAndSync({
        //         ...options,
        //         runOnClient,
        //         callback: (foundModels, fromServer) => {
        //             if (isCurrentRequest) {
        //                 setEntities(foundModels);
        //                 setIsClientLoading(false);
        //                 if (fromServer) {
        //                     setIsServerLoading(false);
        //                 }
        //             }
        //         },
        //         errorCallback: (error, fromServer) => {
        //             if (fromServer) {
        //                 setServerError(error);
        //                 setIsServerLoading(false);
        //                 setIsClientLoading(false);
        //             } else {
        //                 setClientError(error);
        //                 setIsClientLoading(false);
        //             }
        //         },
        //     });
        // });
        return () => {
            isCurrentRequest = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model, runOnClient, ...dependencies]);
    return [
        (_a = entities !== null && entities !== void 0 ? entities : initialValue === null || initialValue === void 0 ? void 0 : initialValue.entities) !== null && _a !== void 0 ? _a : [],
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