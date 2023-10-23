import { SyncModel } from '@ainias42/typeorm-sync';
import { TypeormSyncResult } from './TypeormSyncResult';
import type { TypeormSyncKey } from './fetchQuery';
import { client } from '../../QueryClient';

export function updateResult<ModelType extends typeof SyncModel>(
    queryKey: TypeormSyncKey<ModelType>,
    update: Partial<TypeormSyncResult<InstanceType<ModelType>>>
) {
    let currentData = client.getQueryData<TypeormSyncResult<InstanceType<ModelType>>>(queryKey);
    if (!currentData) {
        currentData = {
            entities: [],
            isServerResult: false,
            clientError: undefined,
            serverError: undefined,
            isServerLoading: false,
            isClientLoading: false,
            ...update,
        };
    } else {
        currentData = {
            ...currentData,
            ...update,
        };
    }
    client.setQueryData(queryKey, currentData);
}
