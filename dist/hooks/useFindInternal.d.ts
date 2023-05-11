import { MultipleInitialResult, MultipleInitialResultJSON, SingleInitialResult, SingleInitialResultJSON, SyncModel, SyncOptions } from '@ainias42/typeorm-sync';
import { SyncFindManyOptions } from '../SyncFindManyOptions';
import { FindManyOptions } from 'typeorm';
import { SyncFindOneOptions } from '../SyncFindOneOptions';
import { ErrorType } from './ErrorType';
type OtherOptions = {
    outdatedAfter: number;
};
type FindOneParams<ModelType extends typeof SyncModel> = {
    modelOrInitialResult: ModelType | SingleInitialResult<ModelType> | SingleInitialResultJSON<ModelType>;
    findOptionsOrIdOrOptions?: SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>> | number | Partial<OtherOptions> | (() => SyncOptions<SyncFindOneOptions<InstanceType<ModelType>>>);
    dependenciesOrOptions?: any[] | Partial<OtherOptions>;
    options?: Partial<OtherOptions>;
    multiple: false;
};
type FindManyParams<ModelType extends typeof SyncModel> = {
    modelOrInitialResult: ModelType | MultipleInitialResult<ModelType> | MultipleInitialResultJSON<ModelType>;
    findOptionsOrIdOrOptions?: SyncOptions<SyncFindManyOptions<InstanceType<ModelType>>> | (() => SyncOptions<FindManyOptions<InstanceType<ModelType>>>) | Partial<OtherOptions>;
    dependenciesOrOptions?: Partial<OtherOptions> | any[];
    options?: Partial<OtherOptions>;
    multiple: true;
};
export declare function useFindInternal<ModelType extends typeof SyncModel>(params: FindManyParams<ModelType> | FindOneParams<ModelType>): readonly [InstanceType<ModelType> | InstanceType<ModelType>[] | null, import("./LoadingState").LoadingState, {
    type: ErrorType;
    error: any;
} | undefined, any, {
    readonly model: ModelType;
    readonly queryId: string;
}];
export {};
