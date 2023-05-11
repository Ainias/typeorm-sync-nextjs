import { LoadingState } from '../hooks/LoadingState';
import { SyncModel } from '@ainias42/typeorm-sync';
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
declare const initialState: {
    queries: Record<string, QueryResult<any>>;
    triggers: Record<number, string[]>;
    triggerTimeouts: Record<number, NodeJS.Timeout>;
};
export type TypeormSyncStoreState = typeof initialState & ReturnType<typeof actionsGenerator>;
type SetState = (newState: TypeormSyncStoreState | Partial<TypeormSyncStoreState> | ((state: TypeormSyncStoreState) => TypeormSyncStoreState | Partial<TypeormSyncStoreState>), replace?: boolean) => void;
type GetState = () => Readonly<TypeormSyncStoreState>;
declare const actionsGenerator: (set: SetState, get: GetState) => {
    clear(): void;
    initQuery(id: string): void;
    setLoadingState(id: string, loadingState: LoadingState): void;
    setQueryResult(id: string, result: InstanceType<any>[], isServerResult: boolean): void;
    setTriggeringEntities(queryId: string, models: (typeof SyncModel)[]): void;
    setClientOnlyReload(id: string, clientOnlyReload: () => Promise<void>): void;
    trigger(modelId: number): void;
    setQueryError(id: string, error: any, isServerError: boolean, restoreBackup?: boolean): void;
};
export declare const useTypeormSyncCache: import("zustand").UseBoundStore<import("zustand").StoreApi<TypeormSyncStoreState>>;
export {};
