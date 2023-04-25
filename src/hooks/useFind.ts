import { MultipleInitialResult, MultipleInitialResultJSON, SyncModel, SyncOptions } from '@ainias42/typeorm-sync';
import { FindManyOptions } from 'typeorm';
import { SyncFindManyOptions } from '../SyncFindManyOptions';
import { useFindInternal } from './useFindInternal';
import { LoadingState } from './LoadingState';
import { ReloadFunctionWithoutLoadingState } from '@ainias42/use-reload';
import { ErrorType } from './ErrorType';

// Empty result outside of hook => every time same array
const emptyResult: any[] = [];

export type UseFindOptions = { outdatedAfter: number };
export type UseFindReturnType<ModelType extends typeof SyncModel> = Readonly<
    [
        InstanceType<ModelType>[],
        LoadingState,
        { type: ErrorType; error: any } | undefined,
        ReloadFunctionWithoutLoadingState<void>
    ]
>;

export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    findOptions: () => SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>,
    dependencies?: any[],
    options?: Partial<UseFindOptions>
): UseFindReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    findOptions?: SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>,
    options?: Partial<UseFindOptions>
): UseFindReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    options?: Partial<UseFindOptions>
): UseFindReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    findOptions: () => SyncOptions<FindManyOptions<InstanceType<ModelType>>>,
    dependencies?: any[],
    options?: Partial<UseFindOptions>
): UseFindReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    findOptions?: SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>,
    options?: Partial<UseFindOptions>
): UseFindReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    options?: Partial<UseFindOptions>
): UseFindReturnType<ModelType>;

export function useFind<ModelType extends typeof SyncModel>(
    modelOrInitialResult: ModelType | MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    findOptionsOrOptions?:
        | SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>
        | (() => SyncOptions<FindManyOptions<InstanceType<ModelType>>>)
        | Partial<UseFindOptions>,
    dependenciesOrOptions?: Partial<UseFindOptions> | any[],
    options?: Partial<UseFindOptions>
): UseFindReturnType<ModelType> {
    const [result, loadingState, error, loadResult] = useFindInternal({
        multiple: true,
        modelOrInitialResult,
        findOptionsOrIdOrOptions: findOptionsOrOptions,
        dependenciesOrOptions,
        options,
    });

    return [(result ?? emptyResult) as InstanceType<ModelType>[], loadingState, error, loadResult];
}
