import { MultipleInitialResult, MultipleInitialResultJSON, SyncModel, SyncOptions } from '@ainias42/typeorm-sync';
import { FindManyOptions } from 'typeorm';
import { SyncFindManyOptions } from '../SyncFindManyOptions';
import { LoadingState } from './LoadingState';
import { ReloadFunctionWithoutLoadingState } from '@ainias42/use-reload';
import { ErrorType } from './ErrorType';
export type UseFindOptions = {
    outdatedAfter: number;
};
export type UseFindReturnType<ModelType extends typeof SyncModel> = Readonly<[
    InstanceType<ModelType>[],
    LoadingState,
    {
        type: ErrorType;
        error: any;
    } | undefined,
    ReloadFunctionWithoutLoadingState<void>
]>;
export declare function useFind<ModelType extends typeof SyncModel>(model: ModelType, findOptions: () => SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>, dependencies?: any[], options?: Partial<UseFindOptions>): UseFindReturnType<ModelType>;
export declare function useFind<ModelType extends typeof SyncModel>(model: ModelType, findOptions?: SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>, options?: Partial<UseFindOptions>): UseFindReturnType<ModelType>;
export declare function useFind<ModelType extends typeof SyncModel>(model: ModelType, options?: Partial<UseFindOptions>): UseFindReturnType<ModelType>;
export declare function useFind<ModelType extends typeof SyncModel>(initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>, findOptions: () => SyncOptions<FindManyOptions<InstanceType<ModelType>>>, dependencies?: any[], options?: Partial<UseFindOptions>): UseFindReturnType<ModelType>;
export declare function useFind<ModelType extends typeof SyncModel>(initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>, findOptions?: SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>, options?: Partial<UseFindOptions>): UseFindReturnType<ModelType>;
export declare function useFind<ModelType extends typeof SyncModel>(initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>, options?: Partial<UseFindOptions>): UseFindReturnType<ModelType>;
