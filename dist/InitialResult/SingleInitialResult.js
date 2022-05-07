"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleInitialResult = void 0;
const typeorm_sync_1 = require("typeorm-sync");
class SingleInitialResult {
    constructor(entity) {
        this.entity = entity;
        this.isServer = typeof window === 'undefined';
        this.date = new Date();
        this.isJson = false;
    }
    toJSON() {
        const modelId = typeorm_sync_1.Database.getModelIdFor(this.entity);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entity: this.entity ? typeorm_sync_1.SyncHelper.toServerResult(this.entity) : null,
            modelId,
            isJson: false,
        };
    }
    static fromJSON(jsonData) {
        if (!('modelId' in jsonData)) {
            return jsonData;
        }
        const result = new SingleInitialResult(null);
        result.date = new Date(jsonData.date);
        result.isServer = jsonData.isServer;
        result.entity = jsonData.entity
            ? typeorm_sync_1.SyncHelper.fromServerResult(typeorm_sync_1.Database.getModelForId(jsonData.modelId), jsonData.entity)
            : null;
        return result;
    }
}
exports.SingleInitialResult = SingleInitialResult;
//# sourceMappingURL=SingleInitialResult.js.map