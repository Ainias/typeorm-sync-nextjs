import { SingleInitialResult, SingleInitialResultJSON, SyncModel, SyncOptions } from '@ainias42/typeorm-sync';
import { LoadingState } from './LoadingState';
import { ErrorType } from './ErrorType';
import { SyncFindOneOptions } from '../SyncFindOneOptions';
import { ReloadFunctionWithoutLoadingState } from '@ainias42/use-reload';
export type UseFindOneOptions = {
    outdatedAfter: number;
};
export type UseFindOneReturnType<ModelType extends typeof SyncModel> = Readonly<[
    InstanceType<ModelType> | null,
    LoadingState,
    ({
        type: ErrorType;
        error: any;
    } | undefined),
    (newEntity: InstanceType<ModelType>, extraData?: any) => Promise<void>,
    ReloadFunctionWithoutLoadingState<void>
]>;
export declare function useFindOne<ModelType extends typeof SyncModel>(initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>, options?: Partial<UseFindOneOptions>): UseFindOneReturnType<ModelType>;
export declare function useFindOne<ModelType extends typeof SyncModel>(initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>, findOptions: () => SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>, dependencies?: any[], options?: Partial<UseFindOneOptions>): UseFindOneReturnType<ModelType>;
export declare function useFindOne<ModelType extends typeof SyncModel>(initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>, findOptions?: SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>, options?: Partial<UseFindOneOptions>): UseFindOneReturnType<ModelType>;
export declare function useFindOne<ModelType extends typeof SyncModel>(initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>, id: number, options?: Partial<UseFindOneOptions>): UseFindOneReturnType<ModelType>;
export declare function useFindOne<ModelType extends typeof SyncModel>(model: ModelType, id: number, options?: Partial<UseFindOneOptions>): UseFindOneReturnType<ModelType>;
export declare function useFindOne<ModelType extends typeof SyncModel>(model: ModelType, findOptions: () => SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>, dependencies?: any[], options?: Partial<UseFindOneOptions>): UseFindOneReturnType<ModelType>;
export declare function useFindOne<ModelType extends typeof SyncModel>(model: ModelType, findOptions?: SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>, options?: Partial<UseFindOneOptions>): UseFindOneReturnType<ModelType>;
