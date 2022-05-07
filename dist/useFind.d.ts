import { SyncModel, SyncOptions } from 'typeorm-sync';
import { FindManyOptions } from 'typeorm';
export declare function useFind<ModelType extends typeof SyncModel>(model: ModelType, options: SyncOptions<FindManyOptions<InstanceType<ModelType>>>, dependencies?: any[]): any;
