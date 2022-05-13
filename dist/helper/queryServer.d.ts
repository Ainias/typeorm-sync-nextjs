import { SyncModel } from 'typeorm-sync';
import { FindManyOptions } from 'typeorm';
export declare function queryServer<Model extends typeof SyncModel>(model: Model, query: FindManyOptions<InstanceType<Model>>, singleInstance: true): Promise<InstanceType<Model>>;
export declare function queryServer<Model extends typeof SyncModel>(model: Model, query: FindManyOptions<InstanceType<Model>>): Promise<InstanceType<Model>[]>;
