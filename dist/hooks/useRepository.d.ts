import { SyncModel } from 'typeorm-sync';
export declare function useRepository<T extends typeof SyncModel>(model: T): import("typeorm").Repository<InstanceType<T>> & {
    saveAndSync: {
        (entities: InstanceType<T>[], options?: import("typeorm").SaveOptions & {
            runOnServer?: boolean;
            extraData?: import("js-helper").JSONValue;
        } & {
            reload: false;
            clientOnly: true;
        }): any;
        (entity: InstanceType<T>, options?: import("typeorm").SaveOptions & {
            runOnServer?: boolean;
            extraData?: import("js-helper").JSONValue;
        } & {
            reload: false;
        }): any;
    };
    save: (__0_0: import("typeorm").DeepPartial<InstanceType<T>>, __0_1?: import("typeorm").SaveOptions, __0_2?: boolean) => Promise<import("typeorm").DeepPartial<InstanceType<T>> & InstanceType<T>>;
    remove: (__0_0: InstanceType<T>, __0_1?: import("typeorm").RemoveOptions, __0_2?: boolean) => Promise<InstanceType<T>>;
    removeAndSync(entity: InstanceType<T>, options?: import("typeorm-sync").SyncOptions<import("typeorm").RemoveOptions>): Promise<InstanceType<T>>;
    findAndSync(options: import("typeorm-sync").SyncWithCallbackOptions<import("typeorm").FindManyOptions<InstanceType<T>>, InstanceType<T>[]>): Promise<void>;
    findOneAndSync(options: import("typeorm-sync").SyncWithCallbackOptions<import("typeorm").FindOneOptions<InstanceType<T>>, InstanceType<T>>): Promise<void>;
    initialFind(options?: import("typeorm").FindManyOptions<InstanceType<T>>): Promise<import("typeorm-sync").MultipleInitialResult<T>>;
    initialFindOne(options: import("typeorm").FindOneOptions<InstanceType<T>>): Promise<import("typeorm-sync").SingleInitialResult<T>>;
    initialFindOneBy(options: import("typeorm").FindOptionsWhere<InstanceType<T>> | import("typeorm").FindOptionsWhere<InstanceType<T>>[]): Promise<import("typeorm-sync").SingleInitialResult<T>>;
    initialFindOneById(id: number): Promise<import("typeorm-sync").SingleInitialResult<T>>;
};
