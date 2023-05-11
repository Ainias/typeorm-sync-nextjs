import { SyncModel } from '@ainias42/typeorm-sync';
type RelationshipTree = {
    [key: string]: RelationshipTree | Record<string, never>;
};
export declare function getFlatRelationModelsForRelationshipTree(model: typeof SyncModel, relations: RelationshipTree): (typeof SyncModel)[];
export declare function getFlatRelationModels(model: typeof SyncModel, relationships?: string[]): (typeof SyncModel)[];
export {};
