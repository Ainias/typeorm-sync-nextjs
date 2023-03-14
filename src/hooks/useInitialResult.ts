import {
    Database,
    MultipleInitialResult,
    MultipleInitialResultJSON,
    SingleInitialResult,
    SingleInitialResultJSON,
    SyncModel,
    waitForSyncRepository,
} from '@ainias42/typeorm-sync';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingState } from './LoadingState';
import { ErrorType } from './ErrorType';

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
    const [clientError, setClientError] = useState<any>();
    const [serverError, setServerError] = useState<any>();
    const [isClientLoading, setIsClientLoading] = useState(false);
    const [isServerLoading, setIsServerLoading] = useState(false);

    const [entities, setEntities] = useState<InstanceType<ModelType>[] | InstanceType<ModelType>>(undefined);
    const initialValue = useMemo(() => {
        if ('entities' in jsonInitialValue) {
            return MultipleInitialResult.fromJSON(jsonInitialValue);
        }
        return SingleInitialResult.fromJSON(jsonInitialValue);
    }, [jsonInitialValue]);

    const [reloadCounter, setReloadCounter] = useState(0);
    const saved = useRef(false);
    const isOutdated = new Date().getTime() - initialValue.date.getTime() >= outdatedAfterSeconds * 1000;

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
        let isCurrentRequest = true;

        const synchronize = async () => {
            try {
                await Database.waitForInstance();
                if (!isCurrentRequest) {
                    return;
                }

                const repository = await waitForSyncRepository(initialValue.model);
                if (!isCurrentRequest) {
                    return;
                }

                await repository.findAndSync({
                    ...initialValue.query,
                    runOnClient: isOutdated,
                    callback: (foundModels, fromServer) => {
                        if (!isCurrentRequest) {
                            return;
                        }

                        setEntities(foundModels);
                        setIsClientLoading(false);
                        if (fromServer) {
                            setIsServerLoading(false);
                        }
                    },
                    errorCallback: (error, fromServer) => {
                        if (!isCurrentRequest) {
                            return;
                        }

                        if (fromServer) {
                            setServerError(error);
                            setIsServerLoading(false);
                            setIsClientLoading(false);
                        } else {
                            setClientError(error);
                            setIsClientLoading(false);
                        }
                    },
                });
            } catch (e) {
                console.error(e);
                if (!isCurrentRequest) {
                    return;
                }

                setServerError(e);
                setIsServerLoading(false);
                setIsClientLoading(false);
            }
        };

        if (isOutdated) {
            setClientError(undefined);
            setServerError(undefined);
            setIsClientLoading(false);
            setIsServerLoading(true);

            synchronize();
        }
        return () => {
            isCurrentRequest = false;
        };
    }, [initialValue.model, initialValue.query, isOutdated, reloadCounter]);

    const reload = useCallback(() => setReloadCounter((old) => old + 1), []);

    let resultEntities = entities;
    if (!entities) {
        resultEntities = 'entities' in initialValue ? initialValue.entities : initialValue.entity;
    }

    let loadingState = LoadingState.NOTHING;
    if (isServerLoading) {
        loadingState = LoadingState.SERVER;
    } else if (isClientLoading) {
        loadingState = LoadingState.CLIENT;
    }

    let error;
    if (serverError) {
        error = { type: ErrorType.SERVER, error: serverError };
    } else {
        error = { type: ErrorType.CLIENT, error: clientError };
    }

    return [resultEntities, loadingState, error, reload] as const;
}
