import { SyncModel } from '@ainias42/typeorm-sync';
export declare function useRepository<T extends typeof SyncModel>(model: T): import("typeorm").Repository<InstanceType<T>> & {
    saveAndSync: {
        (entities: InstanceType<T>[], options?: import("typeorm").SaveOptions & {
            runOnServer?: boolean;
            extraData?: import("@ainias42/js-helper").JSONValue;
        } & {
            reload: false;
            clientOnly: true;
        }): any;
        (entity: InstanceType<T>, options?: import("typeorm").SaveOptions & {
            runOnServer?: boolean;
            extraData?: import("@ainias42/js-helper").JSONValue;
        } & {
            reload: false;
        }): any;
    };
    save: (__0_0: import("typeorm").DeepPartial<InstanceType<T>>, __0_1?: import("typeorm").SaveOptions, __0_2?: boolean) => Promise<import("typeorm").DeepPartial<InstanceType<T>> & InstanceType<T>>;
    remove: (__0_0: InstanceType<T>, __0_1?: import("typeorm").RemoveOptions, __0_2?: boolean) => Promise<InstanceType<T>>;
    saveInitialResult: {
        (initialResult: import("@ainias42/typeorm-sync").SingleInitialResult<T> | {
            isServer: boolean;
            date: string;
            entity: import("@ainias42/typeorm-sync").SingleSyncResult;
            modelId: number;
            isJson: true;
            query: import("typeorm").FindOneOptions<InstanceType<T>>;
        }): any;
        (initialResult: import("@ainias42/typeorm-sync").MultipleInitialResult<T> | {
            isServer: boolean;
            date: string;
            entities: import("@ainias42/typeorm-sync").MultipleSyncResults;
            modelId: number;
            isJson: true;
            query: import("typeorm").FindManyOptions<InstanceType<T>>;
        }): any;
    };
    removeAndSync(entity: InstanceType<T>, options?: import("@ainias42/typeorm-sync").SyncOptions<import("typeorm").RemoveOptions>): Promise<InstanceType<T>>;
    findAndSync(options: import("@ainias42/typeorm-sync").SyncWithCallbackOptions<import("typeorm").FindManyOptions<InstanceType<T>>, InstanceType<T>[]>): Promise<void>;
    promiseFindAndSync(options?: import("typeorm").FindManyOptions<InstanceType<T>>): Promise<[InstanceType<T>[], InstanceType<T>[]]>;
    findOneAndSync(options: import("@ainias42/typeorm-sync").SyncWithCallbackOptions<import("typeorm").FindOneOptions<InstanceType<T>>, InstanceType<T>>): Promise<void>;
    initialFind(options?: import("typeorm").FindManyOptions<InstanceType<T>>): Promise<import("@ainias42/typeorm-sync").MultipleInitialResult<T>>;
    initialFindOne(options: import("typeorm").FindOneOptions<InstanceType<T>>): Promise<import("@ainias42/typeorm-sync").SingleInitialResult<T>>;
    initialFindOneBy(options: import("typeorm").FindOptionsWhere<InstanceType<T>> | import("typeorm").FindOptionsWhere<InstanceType<T>>[]): Promise<import("@ainias42/typeorm-sync").SingleInitialResult<T>>;
    initialFindOneById(id: number): Promise<import("@ainias42/typeorm-sync").SingleInitialResult<T>>;
};
