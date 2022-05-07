import { SyncModel } from 'typeorm-sync';
export declare type MultipleInitialResultJSON<ModelType extends typeof SyncModel = any> = ReturnType<MultipleInitialResult<InstanceType<ModelType>>['toJSON']>;
export declare class MultipleInitialResult<ModelType extends SyncModel> {
    isServer: boolean;
    date: Date;
    entities: ModelType[];
    isJson: boolean;
    constructor(entities: ModelType[]);
    toJSON(): {
        isServer: boolean;
        date: string;
        entities: import("typeorm-sync").MultipleSyncResults;
        modelId: number;
        isJson: boolean;
    };
    static fromJSON<ModelType extends typeof SyncModel>(jsonData: MultipleInitialResultJSON<ModelType> | MultipleInitialResult<InstanceType<ModelType>>): MultipleInitialResult<InstanceType<ModelType>>;
}
