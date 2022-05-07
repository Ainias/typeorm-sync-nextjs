import { SyncModel, SyncOptions, MultipleInitialResult, MultipleInitialResultJSON } from 'typeorm-sync';
import { FindManyOptions } from 'typeorm';
import { LoadingState } from './LoadingState';
import { ErrorType } from './ErrorType';
export declare function useFind<ModelType extends typeof SyncModel>(model: ModelType, options?: SyncOptions<FindManyOptions<InstanceType<ModelType>>>, jsonInitialValue?: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>, dependencies?: any[]): readonly [InstanceType<ModelType>[], LoadingState, {
    type: ErrorType;
    error: any;
}];
