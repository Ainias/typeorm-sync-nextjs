import { MultipleInitialResult, MultipleInitialResultJSON, SingleInitialResult, SingleInitialResultJSON, SyncModel } from '@ainias42/typeorm-sync';
import { LoadingState } from './LoadingState';
import { ReloadFunctionWithoutLoadingState } from '@ainias42/use-reload';
export declare function useInitialResult<ModelType extends typeof SyncModel>(jsonInitialValue: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>, outdatedAfterSeconds?: number): [InstanceType<ModelType>[], LoadingState, any, ReloadFunctionWithoutLoadingState<void>];
export declare function useInitialResult<ModelType extends typeof SyncModel>(jsonInitialValue: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>, outdatedAfterSeconds?: number): [InstanceType<ModelType> | null, LoadingState, any, ReloadFunctionWithoutLoadingState<void>];
