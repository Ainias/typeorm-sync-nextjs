"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlatRelationModels = exports.getFlatRelationModelsForRelationshipTree = void 0;
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
function getFlatRelationModelsForRelationshipTree(model, relations) {
    var _a, _b;
    const metadata = (_b = (_a = typeorm_sync_1.Database.getInstance()) === null || _a === void 0 ? void 0 : _a.getConnection()) === null || _b === void 0 ? void 0 : _b.getMetadata(model);
    if (!metadata) {
        return [];
    }
    const loadingRelations = new Set();
    metadata.relations.forEach((relation) => {
        if (relations[relation.propertyName]) {
            const relationModel = relation.type;
            loadingRelations.add(relationModel);
            getFlatRelationModelsForRelationshipTree(relationModel, relations[relation.propertyName]).forEach((foundModel) => loadingRelations.add(foundModel));
        }
    });
    return Array.from(loadingRelations.values());
}
exports.getFlatRelationModelsForRelationshipTree = getFlatRelationModelsForRelationshipTree;
function getFlatRelationModels(model, relationships = []) {
    var _a, _b;
    const metadata = (_b = (_a = typeorm_sync_1.Database.getInstance()) === null || _a === void 0 ? void 0 : _a.getConnection()) === null || _b === void 0 ? void 0 : _b.getMetadata(model);
    if (!metadata) {
        return [];
    }
    const relations = relationships.reduce((obj, rel) => {
        const parts = rel.split('.');
        let tmpObj = obj;
        parts.forEach((part) => {
            var _a;
            tmpObj[part] = (_a = tmpObj[part]) !== null && _a !== void 0 ? _a : {};
            tmpObj = tmpObj[part];
        });
        return obj;
    }, {});
    return getFlatRelationModelsForRelationshipTree(model, relations);
}
exports.getFlatRelationModels = getFlatRelationModels;
//# sourceMappingURL=getFlatRelationModels.js.map