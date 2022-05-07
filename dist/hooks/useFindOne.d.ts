import { SyncModel, SyncOptions, SingleInitialResult, SingleInitialResultJSON } from 'typeorm-sync';
import { FindOneOptions } from 'typeorm';
import { LoadingState } from './LoadingState';
import { ErrorType } from './ErrorType';
import { JSONValue } from 'js-helper';
export declare function useFindOne<ModelType extends typeof SyncModel>(model: ModelType, id: number, jsonInitialValue?: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>): [
    InstanceType<ModelType>,
    LoadingState,
    {
        type: ErrorType;
        error: any;
    },
    (entity: InstanceType<ModelType>, extraData?: JSONValue) => Promise<void>
];
export declare function useFindOne<ModelType extends typeof SyncModel>(model: ModelType, options: SyncOptions<FindOneOptions<InstanceType<ModelType>>>, jsonInitialValue?: SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>, dependencies?: any[]): [
    InstanceType<ModelType>,
    LoadingState,
    {
        type: ErrorType;
        error: any;
    },
    (entity: InstanceType<ModelType>, extraData?: JSONValue) => Promise<void>
];
