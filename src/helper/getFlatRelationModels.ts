import { Database, SyncModel } from '@ainias42/typeorm-sync';

type RelationshipTree = { [key: string]: RelationshipTree | Record<string, never> };

export function getFlatRelationModelsForRelationshipTree(model: typeof SyncModel, relations: RelationshipTree) {
    const metadata = Database.getInstance()?.getConnection()?.getMetadata(model);
    if (!metadata) {
        return [];
    }

    const loadingRelations = new Set<typeof SyncModel>();
    metadata.relations.forEach((relation) => {
        if (relations[relation.propertyName]) {
            const relationModel = relation.type as typeof SyncModel;
            loadingRelations.add(relationModel);
            getFlatRelationModelsForRelationshipTree(relationModel, relations[relation.propertyName]).forEach(
                (foundModel) => loadingRelations.add(foundModel)
            );
        }
    });

    return Array.from(loadingRelations.values());
}

export function getFlatRelationModels(model: typeof SyncModel, relationships: string[] = []) {
    const metadata = Database.getInstance()?.getConnection()?.getMetadata(model);
    if (!metadata) {
        return [];
    }
    const relations = relationships.reduce((obj, rel) => {
        const parts = rel.split('.');
        let tmpObj: RelationshipTree = obj;
        parts.forEach((part) => {
            tmpObj[part] = tmpObj[part] ?? {};
            tmpObj = tmpObj[part];
        });
        return obj;
    }, {});

    return getFlatRelationModelsForRelationshipTree(model, relations);
}
