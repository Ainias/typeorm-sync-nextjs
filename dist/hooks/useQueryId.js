"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQueryId = void 0;
const react_1 = require("react");
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
function useQueryId(model, options) {
    return (0, react_1.useMemo)(() => `${typeorm_sync_1.Database.getModelIdFor(model)}-${JSON.stringify(options !== null && options !== void 0 ? options : {})}`, [model, options]);
}
exports.useQueryId = useQueryId;
//# sourceMappingURL=useQueryId.js.map