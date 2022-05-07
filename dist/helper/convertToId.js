"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToId = void 0;
function convertToId(val) {
    if (typeof val === 'string') {
        const res = parseInt(val, 10);
        return Number.isNaN(res) ? undefined : res;
    }
    if (typeof val === 'number') {
        return Math.floor(val);
    }
    return undefined;
}
exports.convertToId = convertToId;
//# sourceMappingURL=convertToId.js.map