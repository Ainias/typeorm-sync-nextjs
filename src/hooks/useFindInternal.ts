import {
    Database,
    MultipleInitialResult,
    MultipleInitialResultJSON,
    SingleInitialResult,
    SingleInitialResultJSON,
    SyncModel,
    SyncOptions,
    waitForSyncRepository,
} from '@ainias42/typeorm-sync';
import { SyncFindManyOptions } from '../SyncFindManyOptions';
import { FindManyOptions } from 'typeorm';
import { SyncFindOneOptions } from '../SyncFindOneOptions';
import { useEffect, useMemo, useRef } from 'react';
import { isInitialResult } from '../helper/isInitialResult';
import { ErrorType } from './ErrorType';
import { useQuery } from '@tanstack/react-query';
import { fetchQuery, TypeormSyncKey } from './fetchQuery/fetchQuery';
import { TypeormSyncResult } from './fetchQuery/TypeormSyncResult';
import { updateResult } from './fetchQuery/updateResult';
import { LoadingState } from './LoadingState';
import { getFlatRelationModels } from '../helper/getFlatRelationModels';
import { useTypeormSyncCache } from '../store/useTypeormSyncCache';
import { queryContext } from '../QueryClient';

type OtherOptions = { outdatedAfter: number };

type FindOneParams<ModelType extends typeof SyncModel> = {
    modelOrInitialResult: ModelType | SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>;
    findOptionsOrIdOrOptions?:
        | SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>
        | number
        | Partial<OtherOptions>
        | (() => SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>);
    dependenciesOrOptions?: any[] | Partial<OtherOptions>;
    options?: Partial<OtherOptions>;
    multiple: false;
};

type FindManyParams<ModelType extends typeof SyncModel> = {
    modelOrInitialResult: ModelType | MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>;
    findOptionsOrIdOrOptions?:
        | SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>>
        | (() => SyncOptions<FindManyOptions<InstanceType<ModelType>>>)
        | Partial<OtherOptions>;
    dependenciesOrOptions?: Partial<OtherOptions> | any[];
    options?: Partial<OtherOptions>;
    multiple: true;
};

const emptyResult: any[] = [];

export function useFindInternal<ModelType extends typeof SyncModel>(
    params: FindManyParams<ModelType> | FindOneParams<ModelType>
) {
    const { modelOrInitialResult, findOptionsOrIdOrOptions, dependenciesOrOptions, options, multiple } = params;

    const [initialResult, initialLastQueryTimestamp] = useMemo(() => {
        if (isInitialResult(modelOrInitialResult)) {
            const newInitialResult = multiple
                ? MultipleInitialResult.fromJSON(modelOrInitialResult)
                : SingleInitialResult.fromJSON(modelOrInitialResult);
            return [newInitialResult, newInitialResult.isServer ? newInitialResult.date.getTime() : 0];
        }
        return [undefined, 0];
    }, [modelOrInitialResult, multiple]);

    const model = useMemo(() => {
        if (initialResult) {
            return initialResult.model;
        }
        return modelOrInitialResult as ModelType;
    }, [initialResult, modelOrInitialResult]);

    const dependencies = Array.isArray(dependenciesOrOptions) ? dependenciesOrOptions : [];
    const query = useMemo(() => {
        if (typeof findOptionsOrIdOrOptions === 'function') {
            return findOptionsOrIdOrOptions();
        }
        if (typeof findOptionsOrIdOrOptions === 'number') {
            return { id: findOptionsOrIdOrOptions } as SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>;
        }
        if (findOptionsOrIdOrOptions && !('outdatedAfter' in findOptionsOrIdOrOptions)) {
            return findOptionsOrIdOrOptions as SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>;
        }
        if (initialResult) {
            return initialResult.query;
        }
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelOrInitialResult, ...dependencies]);

    const { outdatedAfter = 30 } =
        options ??
        (dependenciesOrOptions && !Array.isArray(dependenciesOrOptions)
            ? dependenciesOrOptions
            : typeof findOptionsOrIdOrOptions === 'object' && 'outdatedAfter' in findOptionsOrIdOrOptions
            ? findOptionsOrIdOrOptions
            : {});

    const initialData = useMemo(() => {
        if (initialResult) {
            const entities =
                'entities' in initialResult
                    ? initialResult.entities
                    : initialResult.entity
                    ? [initialResult.entity]
                    : [];
            return {
                entities,
                isServerResult: initialResult.isServer,
                clientError: undefined,
                serverError: undefined,
                isServerLoading: false,
                isClientLoading: false,
            } satisfies TypeormSyncResult<InstanceType<ModelType>>;
        }
        return undefined;
    }, [initialResult]);

    const queryKey = useMemo(() => [Database.getModelIdFor(model), query] as TypeormSyncKey<ModelType>, [model, query]);

    let queryData: {
        data: TypeormSyncResult<InstanceType<ModelType>> | undefined;
        error: null | Error;
    } = {
        data: initialData,
        error: null,
    };

    if (Database.isClientDatabase()) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        queryData = useQuery({
            queryKey,
            queryFn: ({ queryKey: currentQueryKey }) => fetchQuery(currentQueryKey),
            keepPreviousData: true,
            initialDataUpdatedAt: initialLastQueryTimestamp,
            initialData,
            staleTime: outdatedAfter * 1000,
            cacheTime: outdatedAfter * 1000,
            context: queryContext,
        });
    }
    const { data, error } = queryData;

    // Save result to indexedDB
    const isOutdated = Date.now() - initialLastQueryTimestamp > outdatedAfter * 1000;
    const saved = useRef(false);
    useEffect(() => {
        if (!saved.current && !isOutdated && initialResult) {
            saved.current = true;
            Database.waitForInstance()
                .then(async () => {
                    const repository = await waitForSyncRepository(initialResult.model);
                    await repository.saveInitialResult(initialResult as SingleInitialResult<ModelType>);
                })
                .catch((e) => console.error('useFindInternal - Error - saveResult: ', e));

            // Data is only from client, initialData is inside saved query. Server is not loaded => Reload data from server manually
            if (!initialResult.isServer) {
                fetchQuery(queryKey, false, true).then((result) => updateResult(queryKey, result));
            }
        }
    }, [initialResult, isOutdated, queryKey]);

    const setTriggeringEntities = useTypeormSyncCache((state) => state.setTriggeringEntities);
    const run = useRef(0);
    useMemo(() => {
        run.current++;
        const currentRun = run.current;

        if (Database.isClientDatabase()) {
            // TODO on unregister remove listeners(?)
            Database.waitForInstance()
                .then((instance) => instance.getConnectionPromise())
                .then(() => {
                    if (run.current !== currentRun) {
                        return;
                    }
                    const triggeringModels = getFlatRelationModels(model, query?.relations as string[]);
                    triggeringModels.push(model);
                    setTriggeringEntities(queryKey, triggeringModels);
                });
        }
    }, [model, query?.relations, setTriggeringEntities, queryKey]);

    const { clientError, serverError, entities, isClientLoading, isServerLoading } = data ?? {};

    let syncError;
    if (error) {
        syncError = { type: ErrorType.UNNKOWN, error };
    } else if (serverError) {
        syncError = { type: ErrorType.SERVER, error: serverError };
    } else if (clientError) {
        syncError = { type: ErrorType.CLIENT, error: clientError };
    }

    const loadingState =
        isClientLoading && isServerLoading
            ? LoadingState.CLIENT_AND_SERVER
            : isServerLoading
            ? LoadingState.SERVER
            : isClientLoading
            ? LoadingState.CLIENT
            : LoadingState.NOTHING;

    return {
        entities: entities ?? (emptyResult as InstanceType<ModelType>[]),
        error: syncError,
        loadingState,
        queryData,
        queryKey,
    };
}

export type UseFindInternalReturnType<ModelType extends typeof SyncModel> = ReturnType<
    typeof useFindInternal<ModelType>
>;
