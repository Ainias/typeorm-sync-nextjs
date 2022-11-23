import {
    Database,
    waitForSyncRepository,
    SyncModel,
    SyncOptions,
    MultipleInitialResult,
    MultipleInitialResultJSON,
} from 'typeorm-sync';
import { useEffect, useState } from 'react';
import { FindManyOptions } from 'typeorm';
import { LoadingState } from './LoadingState';
import { ErrorType } from './ErrorType';

// Empty result outside of hook => every time same array
const emptyResult = [];

export function useFind<ModelType extends typeof SyncModel>(
    model: ModelType,
    options: SyncOptions<FindManyOptions<InstanceType<ModelType>>> = {},
    jsonInitialValue?: MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>,
    dependencies: any[] = []
) {
    const [clientError, setClientError] = useState<any>();
    const [serverError, setServerError] = useState<any>();
    const [isClientLoading, setIsClientLoading] = useState(false);
    const [isServerLoading, setIsServerLoading] = useState(false);
    const [entities, setEntities] = useState<InstanceType<ModelType>[]>(undefined);

    const initialValue = jsonInitialValue ? MultipleInitialResult.fromJSON(jsonInitialValue) : undefined;

    const [runOnClient] = useState(initialValue === undefined);

    useEffect(() => {
        let isCurrentRequest = true;

        setClientError(undefined);
        setServerError(undefined);
        setIsClientLoading(false);
        setIsServerLoading(true);

        Database.waitForInstance()
            .then(async () => {
                if (!isCurrentRequest) {
                    return;
                }

                const repository = await waitForSyncRepository(model);
                await repository.findAndSync({
                    ...options,
                    runOnClient,
                    callback: (foundModels, fromServer) => {
                        if (isCurrentRequest) {
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
            })
            .catch((e) => {
                console.error(e);
                if (!isCurrentRequest) {
                    return;
                }
                setServerError(e);
                setIsServerLoading(false);
                setIsClientLoading(false);
            });
        return () => {
            isCurrentRequest = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model, runOnClient, ...dependencies]);
    return [
        entities ?? initialValue?.entities ?? emptyResult,
        isServerLoading ? LoadingState.SERVER : isClientLoading ? LoadingState.CLIENT : LoadingState.NOTHING,
        serverError
            ? { type: ErrorType.SERVER, error: serverError }
            : clientError
            ? { type: ErrorType.CLIENT, error: clientError }
            : undefined,
    ] as const;
}
