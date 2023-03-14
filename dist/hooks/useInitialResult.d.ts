import { MultipleInitialResult, MultipleInitialResultJSON, SingleInitialResult, SingleInitialResultJSON, SyncModel } from '@ainias42/typeorm-sync';
export declare function useInitialResult<ModelType extends typeof SyncModel>(jsonInitialValue: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>, outdatedAfterSeconds?: number): any;
export declare function useInitialResult<ModelType extends typeof SyncModel>(jsonInitialValue: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>, outdatedAfterSeconds?: number): any;
