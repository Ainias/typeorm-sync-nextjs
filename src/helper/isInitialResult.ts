import {
    MultipleInitialResult,
    MultipleInitialResultJSON,
    SingleInitialResult,
    SingleInitialResultJSON,
} from '@ainias42/typeorm-sync';

export function isInitialResult(
    value: any
): value is
    | MultipleInitialResult<any>
    | MultipleInitialResultJSON
    | SingleInitialResult<any>
    | SingleInitialResultJSON {
    return typeof value === 'object' && 'isJson' in value;
}
