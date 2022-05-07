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
exports.useFindOne = void 0;
const typeorm_sync_1 = require("typeorm-sync");
const react_1 = require("react");
const LoadingState_1 = require("./LoadingState");
const ErrorType_1 = require("./ErrorType");
const useRepository_1 = require("./useRepository");
// eslint-disable-next-line camelcase
const react_dom_1 = require("react-dom");
function useFindOne(model, optionsOrId, jsonInitialValue, dependencies = []) {
    const [clientError, setClientError] = (0, react_1.useState)();
    const [serverError, setServerError] = (0, react_1.useState)();
    const [isClientLoading, setIsClientLoading] = (0, react_1.useState)(false);
    const [isServerLoading, setIsServerLoading] = (0, react_1.useState)(false);
    const [entity, setEntity] = (0, react_1.useState)(undefined);
    const initialValue = jsonInitialValue ? typeorm_sync_1.SingleInitialResult.fromJSON(jsonInitialValue) : undefined;
    const [runOnClient] = (0, react_1.useState)(initialValue === undefined);
    const repository = (0, useRepository_1.useRepository)(model);
    const options = (0, react_1.useMemo)(() => {
        if (typeof optionsOrId === 'number') {
            return {
                where: {
                    id: optionsOrId,
                },
            };
        }
        return optionsOrId;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, typeof optionsOrId === 'number' ? optionsOrId : undefined]);
    const save = (0, react_1.useCallback)((newEntity, extraData) => __awaiter(this, void 0, void 0, function* () {
        setIsServerLoading(true);
        yield repository.saveAndSync(newEntity, { extraData, reload: false });
        (0, react_dom_1.unstable_batchedUpdates)(() => {
            setIsServerLoading(false);
            setEntity(newEntity);
        });
    }), [repository]);
    (0, react_1.useEffect)(() => {
        if (!repository) {
            return undefined;
        }
        let isCurrentRequest = true;
        setClientError(undefined);
        setServerError(undefined);
        setIsClientLoading(true);
        setIsServerLoading(true);
        typeorm_sync_1.Database.waitForInstance().then(() => {
            if (!isCurrentRequest) {
                return;
            }
            repository.findOneAndSync(Object.assign(Object.assign({}, options), { runOnClient, callback: (foundModels, fromServer) => {
                    if (isCurrentRequest) {
                        setEntity(foundModels);
                        setIsClientLoading(false);
                        if (fromServer) {
                            setIsServerLoading(false);
                        }
                    }
                }, errorCallback: (error, fromServer) => {
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
        });
        return () => {
            isCurrentRequest = false;
        };
    }, [model, options, repository, runOnClient]);
    return [
        entity !== undefined ? entity : initialValue === null || initialValue === void 0 ? void 0 : initialValue.entity,
        isServerLoading ? LoadingState_1.LoadingState.SERVER : isClientLoading ? LoadingState_1.LoadingState.CLIENT : LoadingState_1.LoadingState.NOTHING,
        serverError
            ? { type: ErrorType_1.ErrorType.SERVER, error: serverError }
            : clientError
                ? { type: ErrorType_1.ErrorType.CLIENT, error: clientError }
                : undefined,
        save,
    ];
}
exports.useFindOne = useFindOne;
//# sourceMappingURL=useFindOne.js.map