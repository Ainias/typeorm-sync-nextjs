import { useCallback, useMemo, useRef } from 'react';
import { useTypeormSyncCache } from '../store/useTypeormSyncCache';
import { shallow } from 'zustand/shallow';
import { FindManyOptions } from 'typeorm';
import { Database, SyncModel, waitForSyncRepository } from '@ainias42/typeorm-sync';

export function useLoadResultFor<ModelType extends typeof SyncModel>(
    model: ModelType,
    options: FindManyOptions<InstanceType<ModelType>>,
    initialRunOnClient: boolean
) {
    const queryId = useMemo(() => JSON.stringify(options), [options]);
    const [initQuery, setQueryResult, setQueryError] = useTypeormSyncCache(
        (state) => [state.initQuery, state.setQueryResult, state.setQueryError],
        shallow
    );
    const runOnClient = useRef(initialRunOnClient);

    return useCallback(async () => {
        const currentRunOnClient = runOnClient.current;
        runOnClient.current = true;

        // Load directly from store or else loading state is a dependency and then after
        // loading is done, this callback will change and useEffect in useFind and useFindOne
        // will trigger this function again resulting in an endless loop
        const loadingState = useTypeormSyncCache.getState().queries[queryId]?.loadingState;
        if (loadingState) {
            // Is already loading, do nothing
            return;
        }
        console.log('LOG-d loadResult');

        initQuery(queryId);

        try {
            await Database.waitForInstance();
            const repository = await waitForSyncRepository(model);
            await repository.findAndSync({
                ...options,
                runOnClient: currentRunOnClient,
                callback: (foundModels, fromServer) => {
                    setQueryResult(queryId, foundModels, fromServer);
                },
                errorCallback: (error, fromServer) => {
                    setQueryError(queryId, error, fromServer);
                },
            });
        } catch (e) {
            console.error(e);
            setQueryError(queryId, e, true);
        }
    }, [initQuery, queryId, model, options, setQueryResult, setQueryError]);
}
