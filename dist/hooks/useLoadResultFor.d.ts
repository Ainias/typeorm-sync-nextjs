import { SyncModel } from '@ainias42/typeorm-sync';
import { SyncFindManyOptions } from '../SyncFindManyOptions';
export declare function useLoadResultFor<ModelType extends typeof SyncModel>(model: ModelType, options: SyncFindManyOptions<InstanceType<ModelType>>, initialRunOnClient: boolean): any;
