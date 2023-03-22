import { create } from 'zustand';
import { LoadingState } from '../hooks/LoadingState';
import { SyncModel } from '@ainias42/typeorm-sync';

export type QueryResult<ModelType extends typeof SyncModel> = {
    lastQueryTimestamp: number;
    isServerResult: boolean;
    loadingState: LoadingState;
    result?: InstanceType<ModelType>[] | InstanceType<ModelType>;
    clientError?: any;
    serverError?: any;
};

const initialState = {
    queries: {} as Record<string, QueryResult<any>>,
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

const actionsGenerator = (set: SetState, get: GetState) => ({
    clear() {
        set({ ...actionsGenerator(set, get) }, true);
    },
    setQuery(id: string, query: QueryResult<any>) {
        const { queries } = get();
        set({ queries: { ...queries, [id]: query } });
    },
    initQuery(id: string) {
        const { queries } = get();
        const query: QueryResult<any> = {
            lastQueryTimestamp: new Date().getTime(),
            isServerResult: false,
            loadingState: LoadingState.CLIENT_AND_SERVER,
            clientError: undefined,
            serverError: undefined,
            result: queries[id]?.result,
        };
        set({ queries: { ...queries, [id]: query } });
    },
    setQueryResult(id: string, result: InstanceType<any>[] | InstanceType<any>, isServerResult: boolean) {
        const { queries } = get();
        const query = queries[id];
        if (!query) {
            return;
        }
        query.result = result;
        query.isServerResult = isServerResult;
        if (isServerResult) {
            query.loadingState = LoadingState.NOTHING;
        } else if (query.loadingState !== LoadingState.NOTHING) {
            query.loadingState = LoadingState.SERVER;
        }

        set({ queries: { ...queries, [id]: { ...query } } });
    },
    setQueryError(id: string, error: any, isServerError: boolean) {
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

        set({ queries: { ...queries, [id]: { ...query } } });
    },
});

export const useTypeormSyncCache = create<TypeormSyncStoreState>((set, get) => ({
    ...initialState,
    ...actionsGenerator(set, get),
}));
