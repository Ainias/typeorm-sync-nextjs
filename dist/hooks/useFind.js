"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFind = void 0;
const useFindInternal_1 = require("./useFindInternal");
// Empty result outside of hook => every time same array
const emptyResult = [];
function useFind(modelOrInitialResult, findOptionsOrOptions, dependenciesOrOptions, options) {
    const [result, loadingState, error, loadResult] = (0, useFindInternal_1.useFindInternal)({
        multiple: true,
        modelOrInitialResult,
        findOptionsOrIdOrOptions: findOptionsOrOptions,
        dependenciesOrOptions,
        options,
    });
    return [(result !== null && result !== void 0 ? result : emptyResult), loadingState, error, loadResult];
}
exports.useFind = useFind;
//# sourceMappingURL=useFind.js.map