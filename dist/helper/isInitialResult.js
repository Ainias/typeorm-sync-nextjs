"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInitialResult = void 0;
function isInitialResult(value) {
    return typeof value === 'object' && 'isJson' in value;
}
exports.isInitialResult = isInitialResult;
//# sourceMappingURL=isInitialResult.js.map