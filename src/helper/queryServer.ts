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
}
