import { SyncModel } from 'typeorm-sync';
export declare type SingleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<SingleInitialResult<ModelType>['toJSON']>;
export declare class SingleInitialResult<ModelType extends typeof SyncModel> {
    isServer: boolean;
    date: Date;
    entity: InstanceType<ModelType> | null;
    isJson: boolean;
    constructor(entity: InstanceType<ModelType> | null);
    toJSON(): {
        isServer: boolean;
        date: string;
        entity: import("typeorm-sync").SingleSyncResult;
        modelId: number;
        isJson: boolean;
    };
    static fromJSON<ModelType extends typeof SyncModel>(jsonData: SingleInitialResultJSON<ModelType> | SingleInitialResult<ModelType>): SingleInitialResult<ModelType>;
}
