import { useCallback, useMemo, useRef } from 'react';
import { useTypeormSyncCache } from '../store/useTypeormSyncCache';
import { shallow } from 'zustand/shallow';
import { Database, SyncModel, waitForSyncRepository } from '@ainias42/typeorm-sync';
import { useReloadable } from '@ainias42/use-reload';
import { useQueryId } from './useQueryId';
import { SyncFindManyOptions } from '../SyncFindManyOptions';
import { getFlatRelationModels } from '../helper/getFlatRelationModels';

export function useLoadResultFor<ModelType extends typeof SyncModel>(
    model: ModelType,
    options: SyncFindManyOptions<InstanceType<ModelType>>,
    initialRunOnClient: boolean
) {
    const queryId = useQueryId(model, options);
    const [initQuery, setQueryResult, setQueryError, setTriggeringEntities, setClientOnlyReload] = useTypeormSyncCache(
        (state) => [
            state.initQuery,
            state.setQueryResult,
            state.setQueryError,
            state.setTriggeringEntities,
            state.setClientOnlyReload,
        ],
        shallow
    );
    const runOnClient = useRef(initialRunOnClient);

    const reload = useCallback(
        async (clientOnly = false) => {
            const currentRunOnClient = clientOnly || runOnClient.current;
            runOnClient.current = true;

            // Load directly from store or else loading state is a dependency and then after
            // loading is done, this callback will change and useEffect in useFind and useFindOne
            // will trigger this function again resulting in an endless loop
            const loadingState = useTypeormSyncCache.getState().queries[queryId]?.loadingState;
            if (loadingState) {
                // Is already loading, do nothing
                return;
            }

            initQuery(queryId);

            try {
                await Database.waitForInstance();
                const repository = await waitForSyncRepository(model);
                await repository.findAndSync({
                    ...options,
                    runOnServer: !clientOnly,
                    runOnClient: currentRunOnClient,
                    callback: (foundModels, fromServer) => {
                        // fromServer || clientOnly to set loading state to nothing when clientOnly
                        setQueryResult(queryId, foundModels, fromServer || clientOnly);
                    },
                    errorCallback: (error, fromServer) => {
                        // fromServer || clientOnly to set loading state to nothing when clientOnly
                        setQueryError(queryId, error, fromServer || clientOnly);
                    },
                });
            } catch (e) {
                console.error('Error while Reloading: ', e);
                setQueryError(queryId, e, true);
            }
        },
        [initQuery, queryId, model, options, setQueryResult, setQueryError]
    );
    // Do not have a value for clientOnly
    const reloadableCb = useCallback(() => reload(), [reload]);

    const run = useRef(0);
    const isClientDb = Database.getInstance()?.isClientDatabase();
    useMemo(() => {
        run.current++;
        const currentRun = run.current;
        if (isClientDb) {
            Database.getInstance()
                .getConnectionPromise()
                .then(() => {
                    if (run.current !== currentRun) {
                        return;
                    }
                    const triggeringModels = getFlatRelationModels(model, options?.relations);
                    triggeringModels.push(model);
                    setTriggeringEntities(queryId, triggeringModels);
                });
        }
    }, [isClientDb, model, options?.relations, setTriggeringEntities, queryId]);

    useMemo(() => {
        setClientOnlyReload(queryId, () => {
            return reload(true);
        });
    }, [queryId, reload, setClientOnlyReload]);

    const [reloadFunction] = useReloadable(queryId, reloadableCb);
    return reloadFunction;
}
