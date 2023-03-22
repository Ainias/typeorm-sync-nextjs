import {
    Database,
    MultipleInitialResult,
    MultipleInitialResultJSON,
    SingleInitialResult,
    SingleInitialResultJSON,
    SyncModel,
    waitForSyncRepository,
} from '@ainias42/typeorm-sync';
import { useEffect, useMemo, useRef } from 'react';
import { ErrorType } from './ErrorType';
import { useTypeormSyncCache } from '../store/useTypeormSyncCache';
import { useLoadResultFor } from './useLoadResultFor';

// Empty result outside of hook => every time same array

export function useInitialResult<ModelType extends typeof SyncModel>(
    jsonInitialValue: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    outdatedAfterSeconds?: number
);
export function useInitialResult<ModelType extends typeof SyncModel>(
    jsonInitialValue: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    outdatedAfterSeconds?: number
);
export function useInitialResult<ModelType extends typeof SyncModel>(
    jsonInitialValue:
        | MultipleInitialResult<ModelType>
        | MultipleInitialResultJSON<ModelType>
        | SingleInitialResult<ModelType>
        | SingleInitialResultJSON<ModelType>,
    outdatedAfterSeconds = 30
) {
    const initialValue = useMemo(() => {
        if ('entities' in jsonInitialValue) {
            return MultipleInitialResult.fromJSON(jsonInitialValue);
        }
        return SingleInitialResult.fromJSON(jsonInitialValue);
    }, [jsonInitialValue]);

    const queryId = useMemo(() => JSON.stringify(initialValue.query), [initialValue.query]);
    const queryData = useTypeormSyncCache((state) => state.queries[queryId] ?? undefined);
    const { clientError, serverError, loadingState, result: entities } = queryData ?? {};

    const saved = useRef(false);
    const lastQueryTimestamp = queryData?.lastQueryTimestamp ?? initialValue.isServer ? initialValue.date.getTime() : 0;
    const isOutdated = new Date().getTime() - lastQueryTimestamp >= outdatedAfterSeconds * 1000;

    const loadResult = useLoadResultFor(initialValue.model, initialValue.query, false);

    useEffect(() => {
        if (!saved.current && !isOutdated) {
            saved.current = true;
            Database.waitForInstance()
                .then(async () => {
                    const repository = await waitForSyncRepository(initialValue.model);
                    await repository.saveInitialResult(initialValue as MultipleInitialResult<ModelType>);
                })
                .catch((e) => console.error('useInitialResult-Error - saveResult: ', e));
        }
    }, [initialValue, isOutdated]);

    useEffect(() => {
        if (isOutdated) {
            loadResult();
        }
    }, [isOutdated, loadResult]);

    let resultEntities = entities;
    if (!entities) {
        resultEntities = 'entities' in initialValue ? initialValue.entities : initialValue.entity;
    }

    let error;
    if (serverError) {
        error = { type: ErrorType.SERVER, error: serverError };
    } else {
        error = { type: ErrorType.CLIENT, error: clientError };
    }

    return [resultEntities, loadingState, error, loadResult] as const;
}
