import { SyncModel } from '@ainias42/typeorm-sync';
import { FindManyOptions } from 'typeorm';
export declare function useQueryId<ModelType extends typeof SyncModel>(model: ModelType, options?: FindManyOptions<InstanceType<ModelType>>): string;
