import {
    Database,
    SingleInitialResult,
    SingleInitialResultJSON,
    SyncModel,
    SyncOptions,
    waitForSyncRepository,
} from '@ainias42/typeorm-sync';
import { useCallback, useRef } from 'react';
import { JSONValue } from '@ainias42/js-helper';
import { SyncFindOneOptions } from '../SyncFindOneOptions';
import { useFindInternal, UseFindInternalReturnType } from './useFindInternal';
import { updateResult } from './fetchQuery/updateResult';

export type UseFindOneOptions = { outdatedAfter: number };

export type UseFindOneReturnType<ModelType extends typeof SyncModel> = Omit<
    UseFindInternalReturnType<ModelType>,
    'entities'
> & {
    entity: InstanceType<ModelType> | undefined;
    save: (newEntity: InstanceType<ModelType>, extraData?: JSONValue) => Promise<void>;
};

export function useFindOne<ModelType extends typeof SyncModel>(
    initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType>;
export function useFindOne<ModelType extends typeof SyncModel>(
    initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    findOptions: () => SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>,
    dependencies?: any[],
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType>;
export function useFindOne<ModelType extends typeof SyncModel>(
    initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    findOptions?: SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>,
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType>;

export function useFindOne<ModelType extends typeof SyncModel>(
    initialResult: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    id: number,
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType>;
export function useFindOne<ModelType extends typeof SyncModel>(
    model: ModelType,
    id: number,
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType>;

export function useFindOne<ModelType extends typeof SyncModel>(
    model: ModelType,
    findOptions: () => SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>,
    dependencies?: any[],
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType>;
export function useFindOne<ModelType extends typeof SyncModel>(
    model: ModelType,
    findOptions?: SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>,
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType>;

export function useFindOne<ModelType extends typeof SyncModel>(
    modelOrInitialResult: ModelType | SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    findOptionsOrIdOrOptions?:
        | SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>
        | number
        | Partial<UseFindOneOptions>
        | (() => SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>),
    dependenciesOrOptions?: any[] | Partial<UseFindOneOptions>,
    options?: Partial<UseFindOneOptions>
): UseFindOneReturnType<ModelType> {
    const { entities, queryKey, ...other } = useFindInternal({
        multiple: false,
        modelOrInitialResult,
        findOptionsOrIdOrOptions,
        dependenciesOrOptions,
        options,
    });

    const isSaving = useRef(false);
    const save = useCallback(
        async (newEntity: InstanceType<ModelType>, extraData?: JSONValue) => {
            try {
                const model = Database.getModelForId(queryKey[0]) as ModelType;

                if (isSaving.current) {
                    return;
                }
                isSaving.current = true;
                const rep = await waitForSyncRepository(model);
                const savedEntity = await rep.saveAndSync(newEntity, { extraData, reload: false });
                updateResult(queryKey, {
                    entities: [savedEntity],
                    isServerResult: false,
                    clientError: undefined,
                    isClientLoading: false,
                });
            } catch (e) {
                console.error('Got query error', e);
                updateResult(queryKey, {
                    clientError: e,
                    isClientLoading: false,
                });
            } finally {
                isSaving.current = false;
            }
        },
        [queryKey]
    );
    return {
        entity: entities?.[0],
        save,
        queryKey,
        ...other,
    };
}
