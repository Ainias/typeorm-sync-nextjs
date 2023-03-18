import { create } from 'zustand';
import { LoadingState } from '../hooks/LoadingState';

type QueryResult = {
    lastResult?: any;
    lastQueryTimestamp: number;
    lastError?: any;
    isServerResult: boolean;
    isServerError: boolean;
    loadingState: LoadingState;
};

const initialState = {
    queries: {} as Record<string, QueryResult>,
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
});

export const useTypeormSyncCache = create<TypeormSyncStoreState>((set, get) => ({
    ...initialState,
    ...actionsGenerator(set, get),
}));
