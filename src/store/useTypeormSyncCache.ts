import { create } from 'zustand';
import { LoadingState } from '../hooks/LoadingState';
import { Database, SyncHelper, SyncModel } from '@ainias42/typeorm-sync';

export type QueryResult<ModelType extends typeof SyncModel> = {
    lastQueryTimestamp?: number;
    isServerResult: boolean;
    loadingState: LoadingState;
    result?: InstanceType<ModelType>[];
    backupResult?: InstanceType<ModelType>[];
    clientError?: any;
    serverError?: any;
    clientOnlyReload?: () => Promise<void>;
};

const initialState = {
    queries: {} as Record<string, QueryResult<any>>,
    triggers: {} as Record<number, string[]>,
    triggerTimeouts: {} as Record<number, ReturnType<typeof setTimeout>>,
};

export type TypeormSyncStoreState = typeof initialState & ReturnType<typeof actionsGenerator>;

type SetState = (
    newState:
        | TypeormSyncStoreState
        | Partial<TypeormSyncStoreState>
        | ((state: TypeormSyncStoreState) => TypeormSyncStoreState | Partial<TypeormSyncStoreState>),
    replace?: boolean
) => void;
type GetState = () => Readonly<TypeormSyncStoreState>;

function getInitialQuery() {
    return {
        lastQueryTimestamp: undefined,
        isServerResult: false,
        loadingState: LoadingState.NOTHING,
        clientError: undefined,
        serverError: undefined,
        result: undefined,
        backupResult: undefined,
        clientOnlyReload: undefined,
    } as QueryResult<any>;
}

const actionsGenerator = (set: SetState, get: GetState) => ({
    clear() {
        set({ ...actionsGenerator(set, get) }, true);
    },
    initQuery(id: string) {
        const { queries } = get();
        const query: QueryResult<any> = {
            ...(queries[id] ?? getInitialQuery()),
            lastQueryTimestamp: new Date().getTime(),
            loadingState: LoadingState.CLIENT_AND_SERVER,
        };
        set({ queries: { ...queries, [id]: query } });
    },
    setLoadingState(id: string, loadingState: LoadingState) {
        const { queries } = get();
        const query: QueryResult<any> = {
            ...(queries[id] ?? getInitialQuery()),
            loadingState,
        };
        set({ queries: { ...queries, [id]: query } });
    },
    setQueryResult(id: string, result: InstanceType<any>[], isServerResult: boolean) {
        const { queries } = get();
        const query = queries[id];

        const newQuery: QueryResult<any> = {
            ...(query ?? getInitialQuery()),
            loadingState:
                isServerResult || query?.loadingState === LoadingState.NOTHING
                    ? LoadingState.NOTHING
                    : LoadingState.SERVER,
            result,
            backupResult: SyncHelper.clone(result),
            isServerResult,
        };

        set({ queries: { ...queries, [id]: newQuery } });
    },
    setTriggeringEntities(queryId: string, models: (typeof SyncModel)[]) {
        const { triggers } = get();
        models.forEach((model) => {
            const modelId = Database.getModelIdFor(model);
            triggers[modelId] = triggers[modelId] ?? [];
            if (!triggers[modelId].includes(queryId)) {
                triggers[modelId].push(queryId);
            }
        });
    },
    setClientOnlyReload(id: string, clientOnlyReload: () => Promise<void>) {
        const { queries } = get();
        const query: QueryResult<any> = {
            ...(queries[id] ?? getInitialQuery()),
            clientOnlyReload,
        };
        set({ queries: { ...queries, [id]: query } });
    },
    trigger(modelId: number) {
        const { triggers, triggerTimeouts, queries } = get();

        if (triggerTimeouts[modelId]) {
            return;
        }
        const timeout = setTimeout(() => {
            triggers[modelId]?.forEach((queryId) => queries[queryId]?.clientOnlyReload?.());
            set((old) => {
                const oldTriggerTimeouts = { ...old.triggerTimeouts };
                delete oldTriggerTimeouts[modelId];
                return { triggerTimeouts: oldTriggerTimeouts };
            });
        }, 1000);
        set({ triggerTimeouts: { ...triggerTimeouts, [modelId]: timeout } });
    },
    setQueryError(id: string, error: any, isServerError: boolean, restoreBackup = false) {
        const { queries } = get();
        const query = queries[id];
        if (!query) {
            return;
        }
        if (isServerError) {
            query.serverError = error;
            query.loadingState = LoadingState.NOTHING;
        } else {
            query.clientError = error;
            if (query.loadingState !== LoadingState.NOTHING) {
                query.loadingState = LoadingState.SERVER;
            }
        }

        if (restoreBackup && query.backupResult) {
            query.result = SyncHelper.clone(query.backupResult);
        }

        set({ queries: { ...queries, [id]: { ...query } } });
    },
});

export const useTypeormSyncCache = create<TypeormSyncStoreState>((set, get) => ({
    ...initialState,
    ...actionsGenerator(set, get),
}));
