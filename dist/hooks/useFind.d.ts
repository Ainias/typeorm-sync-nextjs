import { SyncModel, SyncOptions, MultipleInitialResult, MultipleInitialResultJSON } from '@ainias42/typeorm-sync';
import { FindManyOptions } from 'typeorm';
export declare function useFind<ModelType extends typeof SyncModel>(model: ModelType, options?: SyncOptions<FindManyOptions<InstanceType<ModelType>>>, dependencies?: any[]): any;
/** @deprecated useFind with jsonInitialValue is deprecated. Use 'useInitialResult' instead */
export declare function useFind<ModelType extends typeof SyncModel>(model: ModelType, options?: SyncOptions<FindManyOptions<InstanceType<ModelType>>>, jsonInitialValue?: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>, dependencies?: any[]): any;
