import { SyncModel, SyncOptions, MultipleInitialResult, MultipleInitialResultJSON } from '@ainias42/typeorm-sync';
import { useEffect, useMemo } from 'react';
import { FindManyOptions } from 'typeorm';
import { ErrorType } from './ErrorType';
import { useTypeormSyncCache } from '../store/useTypeormSyncCache';
import { useLoadResultFor } from './useLoadResultFor';
import { useQueryId } from './useQueryId';

// Empty result outside of hook => every time same array
const emptyResult = [];

export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    options?: SyncOptions<FindManyOptions<InstanceType<ModelType>>>,
    dependencies?: any[]
);

/** @deprecated useFind with jsonInitialValue is deprecated. Use 'useInitialResult' instead */
export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    options?: SyncOptions<FindManyOptions<InstanceType<ModelType>>>,
    jsonInitialValue?: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    dependencies?: any[]
);
export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    options: SyncOptions<FindManyOptions<InstanceType<ModelType>>> = {},
    jsonInitialValueOrDependencies?: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType> | any[],
    dependencies: any[] = []
) {
    const jsonInitialValue = Array.isArray(jsonInitialValueOrDependencies) ? undefined : jsonInitialValueOrDependencies;
    if (Array.isArray(jsonInitialValueOrDependencies)) {
        dependencies = jsonInitialValueOrDependencies;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedOptions = useMemo(() => options, dependencies);

    const queryId = useQueryId(model, options);
    const queryData = useTypeormSyncCache((state) => state.queries[queryId] ?? undefined);

    const { clientError, serverError, loadingState, result: entities } = queryData ?? {};
    const initialValue = jsonInitialValue ? MultipleInitialResult.fromJSON(jsonInitialValue) : undefined;

    const loadResult = useLoadResultFor(model, memoizedOptions, !initialValue);

    useEffect(() => {
        console.log('LOG-d useFind - loadResult');
        loadResult();
    }, [loadResult]);

    return [
        entities ?? initialValue?.entities ?? emptyResult,
        loadingState,
        serverError
            ? { type: ErrorType.SERVER, error: serverError }
            : clientError
            ? { type: ErrorType.CLIENT, error: clientError }
            : undefined,
    ] as const;
}
