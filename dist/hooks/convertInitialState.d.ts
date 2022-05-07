import { SyncModel } from 'typeorm-sync';
export declare function convertInitialValue<ModelType extends typeof SyncModel>(model: ModelType, initialValue: InstanceType<ModelType>): InstanceType<ModelType>;
export declare function convertInitialValue<ModelType extends typeof SyncModel>(model: ModelType, initialValue: InstanceType<ModelType>[]): InstanceType<ModelType>[];
export declare function convertInitialValue<ModelType extends typeof SyncModel>(model: ModelType, initialValue: undefined): undefined;
