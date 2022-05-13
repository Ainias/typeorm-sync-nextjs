import {
    SyncModel,
    SyncOptions,
    Database,
    SingleInitialResult,
    SingleInitialResultJSON,
    waitForSyncRepository,
} from 'typeorm-sync';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FindOneOptions, FindOptionsWhere } from 'typeorm';
import { LoadingState } from './LoadingState';
import { ErrorType } from './ErrorType';
import { useRepository } from './useRepository';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';
import { JSONValue } from 'js-helper';

export function useFindOne<ModelType extends typeof SyncModel>(
    model: ModelType,
    id: number,
    jsonInitialValue?: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>
): [
    InstanceType<ModelType>,
    LoadingState,
    { type: ErrorType; error: any },
    (entity: InstanceType<ModelType>, extraData?: JSONValue) => Promise<void>
];
export function useFindOne<ModelType extends typeof SyncModel>(
    model: ModelType,
    options: SyncOptions<FindOneOptions<InstanceType<ModelType>>>,
    jsonInitialValue?: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    dependencies?: any[]
): [
    InstanceType<ModelType>,
    LoadingState,
    { type: ErrorType; error: any },
    (entity: InstanceType<ModelType>, extraData?: JSONValue) => Promise<void>
];
export function useFindOne<ModelType extends typeof SyncModel>(
    model: ModelType,
    optionsOrId: SyncOptions<FindOneOptions<InstanceType<ModelType>>> | number,
    jsonInitialValue?: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>,
    dependencies: any[] = []
) {
    const [clientError, setClientError] = useState<any>();
    const [serverError, setServerError] = useState<any>();
    const [isClientLoading, setIsClientLoading] = useState(false);
    const [isServerLoading, setIsServerLoading] = useState(false);
    const [entity, setEntity] = useState<InstanceType<ModelType>>(undefined);

    const initialValue = jsonInitialValue ? SingleInitialResult.fromJSON(jsonInitialValue) : undefined;

    const [runOnClient] = useState(initialValue === undefined);
    const repository = useRepository(model);

    const options: SyncOptions<FindOneOptions<InstanceType<ModelType>>> = useMemo(() => {
        if (typeof optionsOrId === 'number') {
            return {
                where: {
                    id: optionsOrId,
                } as FindOptionsWhere<InstanceType<ModelType>>,
            };
        }
        return optionsOrId;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, typeof optionsOrId === 'number' ? optionsOrId : undefined]);

    const save = useCallback(
        async (newEntity: InstanceType<ModelType>, extraData?: JSONValue) => {
            setIsServerLoading(true);
            const rep = await waitForSyncRepository(model);
            await rep.saveAndSync(newEntity, { extraData, reload: false });
            unstable_batchedUpdates(() => {
                setIsServerLoading(false);
                setEntity(newEntity);
            });
        },
        [model]
    );

    useEffect(() => {
        if (!repository) {
            return undefined;
        }

        let isCurrentRequest = true;

        setClientError(undefined);
        setServerError(undefined);
        setIsClientLoading(true);
        setIsServerLoading(true);

        Database.waitForInstance().then(() => {
            if (!isCurrentRequest) {
                return;
            }

            repository.findOneAndSync({
                ...options,
                runOnClient,
                callback: (foundModels, fromServer) => {
                    if (isCurrentRequest) {
                        setEntity(foundModels);
                        setIsClientLoading(false);
                        if (fromServer) {
                            setIsServerLoading(false);
                        }
                    }
                },
                errorCallback: (error, fromServer) => {
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
        });
        return () => {
            isCurrentRequest = false;
        };
    }, [model, options, repository, runOnClient]);

    return [
        entity !== undefined ? entity : initialValue?.entity,
        isServerLoading ? LoadingState.SERVER : isClientLoading ? LoadingState.CLIENT : LoadingState.NOTHING,
        serverError
            ? { type: ErrorType.SERVER, error: serverError }
            : clientError
            ? { type: ErrorType.CLIENT, error: clientError }
            : undefined,
        save,
    ] as const;
}
