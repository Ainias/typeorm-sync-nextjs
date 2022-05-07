"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleInitialResult = void 0;
const typeorm_sync_1 = require("typeorm-sync");
class MultipleInitialResult {
    constructor(entities) {
        this.entities = entities;
        this.isServer = typeof window === 'undefined';
        this.date = new Date();
        this.isJson = false;
    }
    toJSON() {
        const modelId = typeorm_sync_1.Database.getModelIdFor(this.entities[0]);
        return {
            isServer: this.isServer,
            date: this.date.toISOString(),
            entities: this.entities ? typeorm_sync_1.SyncHelper.toServerResult(this.entities) : null,
            modelId,
            isJson: true,
        };
    }
    static fromJSON(jsonData) {
        console.log('LOG multiple from json', jsonData);
        if (!('modelId' in jsonData)) {
            return jsonData;
        }
        const result = new MultipleInitialResult([]);
        result.date = new Date(jsonData.date);
        result.isServer = jsonData.isServer;
        result.entities = jsonData.entities
            ? typeorm_sync_1.SyncHelper.fromServerResult(typeorm_sync_1.Database.getModelForId(jsonData.modelId), jsonData.entities)
            : null;
        return result;
    }
}
exports.MultipleInitialResult = MultipleInitialResult;
//# sourceMappingURL=MultipleInitialResult.js.map