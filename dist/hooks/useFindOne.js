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
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
const react_1 = require("react");
const LoadingState_1 = require("./LoadingState");
const useTypeormSyncCache_1 = require("../store/useTypeormSyncCache");
const useFindInternal_1 = require("./useFindInternal");
const shallow_1 = require("zustand/shallow");
function useFindOne(modelOrInitialResult, findOptionsOrIdOrOptions, dependenciesOrOptions, options) {
    const [result, loadingState, error, loadResult, { model, queryId }] = (0, useFindInternal_1.useFindInternal)({
        multiple: false,
        modelOrInitialResult,
        findOptionsOrIdOrOptions,
        dependenciesOrOptions,
        options,
    });
    const [setLoadingState, setQueryResult, setQueryError] = (0, useTypeormSyncCache_1.useTypeormSyncCache)((state) => [state.setLoadingState, state.setQueryResult, state.setQueryError], shallow_1.shallow);
    const isSaving = (0, react_1.useRef)(false);
    const save = (0, react_1.useCallback)((newEntity, extraData) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (isSaving.current) {
                return;
            }
            isSaving.current = true;
            setLoadingState(queryId, LoadingState_1.LoadingState.SERVER);
            const rep = yield (0, typeorm_sync_1.waitForSyncRepository)(model);
            const savedEntity = yield rep.saveAndSync(newEntity, { extraData, reload: false });
            setQueryResult(queryId, [savedEntity], true);
        }
        catch (e) {
            console.error('Got query error', e);
            setQueryError(queryId, e, true, true);
        }
        finally {
            isSaving.current = false;
        }
    }), [model, queryId, setLoadingState, setQueryError, setQueryResult]);
    return [result, loadingState, error, save, loadResult];
}
exports.useFindOne = useFindOne;
//# sourceMappingURL=useFindOne.js.map