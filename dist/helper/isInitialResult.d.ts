import { MultipleInitialResult, MultipleInitialResultJSON, SingleInitialResult, SingleInitialResultJSON } from '@ainias42/typeorm-sync';
export declare function isInitialResult(value: any): value is MultipleInitialResult<any> | MultipleInitialResultJSON | SingleInitialResult<any> | SingleInitialResultJSON;
