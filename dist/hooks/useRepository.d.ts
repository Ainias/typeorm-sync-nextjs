import { SyncModel, SyncRepository } from '@ainias42/typeorm-sync';
export declare function useRepository<T extends typeof SyncModel>(model: T): SyncRepository<T> | undefined;
