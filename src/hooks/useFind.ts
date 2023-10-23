import { MultipleInitialResult, MultipleInitialResultJSON, SyncModel, SyncOptions } from '@ainias42/typeorm-sync';
import { FindManyOptions } from 'typeorm';
import { SyncFindManyOptions } from '../SyncFindManyOptions';
import { useFindInternal, UseFindInternalReturnType } from './useFindInternal';

export type UseFindOptions = { outdatedAfter: number };

export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    findOptions: () => SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>,
    dependencies?: any[],
    options?: Partial<UseFindOptions>
): UseFindInternalReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    findOptions?: SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>,
    options?: Partial<UseFindOptions>
): UseFindInternalReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    options?: Partial<UseFindOptions>
): UseFindInternalReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    findOptions: () => SyncOptions<FindManyOptions<InstanceType<ModelType>>>,
    dependencies?: any[],
    options?: Partial<UseFindOptions>
): UseFindInternalReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    findOptions?: SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>,
    options?: Partial<UseFindOptions>
): UseFindInternalReturnType<ModelType>;
export function useFind<ModelType extends typeof SyncModel>(
    initialResult: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    options?: Partial<UseFindOptions>
): UseFindInternalReturnType<ModelType>;

export function useFind<ModelType extends typeof SyncModel>(
    modelOrInitialResult: ModelType | MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    findOptionsOrOptions?:
        | SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>
        | (() => SyncOptions<FindManyOptions<InstanceType<ModelType>>>)
        | Partial<UseFindOptions>,
    dependenciesOrOptions?: Partial<UseFindOptions> | any[],
    options?: Partial<UseFindOptions>
): UseFindInternalReturnType<ModelType> {
    return useFindInternal({
        multiple: true,
        modelOrInitialResult,
        findOptionsOrIdOrOptions: findOptionsOrOptions,
        dependenciesOrOptions,
        options,
    });
}
