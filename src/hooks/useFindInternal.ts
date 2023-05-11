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
import { useQueryId } from './useQueryId';
import { QueryResult, useTypeormSyncCache } from '../store/useTypeormSyncCache';
import { useLoadResultFor } from './useLoadResultFor';
import { ErrorType } from './ErrorType';

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

    const queryId = useQueryId(model, query);
    const queryData: QueryResult<ModelType> = useTypeormSyncCache((state) => state.queries[queryId] ?? undefined);

    const setQueryResult = useTypeormSyncCache((state) => state.setQueryResult);

    const saved = useRef(false);
    const lastQueryTimestamp = queryData?.lastQueryTimestamp ?? initialLastQueryTimestamp;

    const isOutdated = new Date().getTime() - lastQueryTimestamp >= outdatedAfter * 1000;

    const loadResult = useLoadResultFor(model, query as SyncFindOneOptions<InstanceType<ModelType>>, !initialResult);

    useEffect(() => {
        if (!saved.current && !isOutdated && initialResult) {
            saved.current = true;
            Database.waitForInstance()
                .then(async () => {
                    const repository = await waitForSyncRepository(initialResult.model);
                    await repository.saveInitialResult(initialResult as SingleInitialResult<ModelType>);
                })
                .catch((e) => console.error('useFindInternal - Error - saveResult: ', e));
            setQueryResult(
                queryId,
                'entities' in initialResult ? initialResult.entities : [initialResult.entity],
                initialResult.isServer
            );
        }
    }, [initialResult, isOutdated, queryId, setQueryResult]);

    // TODO reload when query changes
    useEffect(() => {
        if (isOutdated) {
            loadResult();
        }
    }, [isOutdated, loadResult]);

    const { clientError, serverError, loadingState, result: entities } = queryData ?? {};
    const resultEntities = ((multiple ? entities : entities?.[0]) ??
        initialResult?.[(multiple ? 'entities' : 'entity') as keyof typeof initialResult] ??
        null) as InstanceType<ModelType>[] | InstanceType<ModelType> | null;

    let error;
    if (serverError) {
        error = { type: ErrorType.SERVER, error: serverError };
    } else if (clientError) {
        error = { type: ErrorType.CLIENT, error: clientError };
    }

    return [resultEntities, loadingState, error, loadResult, { model, queryId }] as const;
}
