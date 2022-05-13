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
exports.queryServer = void 0;
const typeorm_sync_1 = require("typeorm-sync");
function queryServer(model, query, singleInstance = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield typeorm_sync_1.Database.waitForInstance();
        const modelId = typeorm_sync_1.Database.getModelIdFor(model);
        const result = yield db.queryServer(modelId, undefined, query);
        if (result.success === true) {
            const modelContainer = typeorm_sync_1.SyncHelper.convertToModelContainer(result.syncContainer);
            const entities = Object.values(modelContainer[modelId]);
            if (singleInstance) {
                if (entities.length > 0) {
                    return entities[0];
                }
                return null;
            }
            return entities;
        }
        throw new Error(result.error.message);
    });
}
exports.queryServer = queryServer;
//# sourceMappingURL=queryServer.js.map