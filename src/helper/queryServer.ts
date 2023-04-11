import { SyncModel } from '@ainias42/typeorm-sync';
import { FindManyOptions } from 'typeorm';

export async function queryServer<Model extends typeof SyncModel>(
    model: Model,
    query: FindManyOptions<InstanceType<Model>>,
    singleInstance: true
): Promise<InstanceType<Model>>;
export async function queryServer<Model extends typeof SyncModel>(
    model: Model,
    query: FindManyOptions<InstanceType<Model>>
): Promise<InstanceType<Model>[]>;
export async function queryServer<Model extends typeof SyncModel>(
    model: Model,
    query: FindManyOptions<InstanceType<Model>>,
    singleInstance = false
) {
    if (singleInstance) {
        return undefined;
    }
    return [];

    // const db = await Database.waitForInstance();
    // const modelId = Database.getModelIdFor(model);
    // const result = await db.queryServer(modelId, undefined, query);
    //
    // if (result.success === true) {
    //     const modelContainer = SyncHelper.convertToModelContainer(result.syncContainer);
    //     const entities = Object.values(modelContainer[modelId]) as InstanceType<Model>[];
    //     if (singleInstance) {
    //         if (entities.length > 0) {
    //             return entities[0];
    //         }
    //         return null;
    //     }
    //     return entities;
    // }
    // throw new Error(result.error.message);
}
