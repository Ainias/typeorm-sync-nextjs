import {
    SingleInitialResult,
    SingleInitialResultJSON,
    SyncModel,
    SyncOptions,
    waitForSyncRepository,
} from '@ainias42/typeorm-sync';
import { useCallback, useRef } from 'react';
import { LoadingState } from './LoadingState';
import { ErrorType } from './ErrorType';
import { JSONValue } from '@ainias42/js-helper';
import { useTypeormSyncCache } from '../store/useTypeormSyncCache';
import { SyncFindOneOptions } from '../SyncFindOneOptions';
import { useFindInternal } from './useFindInternal';
import { shallow } from 'zustand/shallow';
import { ReloadFunctionWithoutLoadingState } from '@ainias42/use-reload';

export type UseFindOneOptions = { outdatedAfter: number };

export type UseFindOneReturnType<ModelType extends typeof SyncModel> = Readonly<
    [
        InstanceType<ModelType> | null,
        LoadingState,
        (
            | {
                  type: ErrorType;
                  error: any;
              }
            | undefined
        ),
        (newEntity: InstanceType<ModelType>, extraData?: any) => Promise<void>,
        ReloadFunctionWithoutLoadingState<void>
    ]
>;

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
    const [result, loadingState, error, loadResult, { model, queryId }] = useFindInternal({
        multiple: false,
        modelOrInitialResult,
        findOptionsOrIdOrOptions,
        dependenciesOrOptions,
        options,
    });

    const [setLoadingState, setQueryResult, setQueryError] = useTypeormSyncCache(
        (state) => [state.setLoadingState, state.setQueryResult, state.setQueryError],
        shallow
    );

    const isSaving = useRef(false);
    const save = useCallback(
        async (newEntity: InstanceType<ModelType>, extraData?: JSONValue) => {
            try {
                if (isSaving.current) {
                    console.log('LOG-d not saving, because save is already runnning');
                    return;
                }
                isSaving.current = true;

                setLoadingState(queryId, LoadingState.SERVER);
                const rep = await waitForSyncRepository(model);
                const savedEntity = await rep.saveAndSync(newEntity, { extraData, reload: false });
                console.log('LOG-d settingQueryResult on client after save!', savedEntity);
                setQueryResult(queryId, savedEntity, true);
            } catch (e) {
                console.error('LOG-d Got query error', e);
                setQueryError(queryId, e, true, true);
            } finally {
                isSaving.current = false;
            }
        },
        [model, queryId, setLoadingState, setQueryError, setQueryResult]
    );

    return [result as InstanceType<ModelType> | null, loadingState, error, save, loadResult] as const;
}
