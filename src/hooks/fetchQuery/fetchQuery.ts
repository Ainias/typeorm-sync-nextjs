import { Database, SyncModel, waitForSyncRepository } from '@ainias42/typeorm-sync';
import { SyncFindManyOptions } from '../../SyncFindManyOptions';
import { PromiseWithHandlers } from '@ainias42/js-helper';
import { TypeormSyncResult } from './TypeormSyncResult';
import { updateResult } from './updateResult';
import { client } from '../../QueryClient';

export type TypeormSyncKey<ModelType extends typeof SyncModel> = [number, SyncFindManyOptions<InstanceType<ModelType>>];

export async function fetchQuery<ModelType extends typeof SyncModel>(
    [modelId, query]: TypeormSyncKey<ModelType>,
    fetchClient = true,
    fetchServer = true
) {
    if (!fetchServer && !fetchClient) {
        return {
            isServerLoading: false,
            isClientLoading: false,
            isServerResult: false,
            serverError: undefined,
            clientError: undefined,
            entities: [],
        } satisfies TypeormSyncResult<InstanceType<ModelType>>;
    }

    await Database.waitForInstance();
    const model = Database.getModelForId(modelId) as ModelType;
    const repository = await waitForSyncRepository(model);

    const currentState = client.getQueryData<TypeormSyncResult<InstanceType<ModelType>>>([modelId, query]);
    if (currentState?.isServerLoading || (!fetchServer && currentState?.isClientLoading)) {
        return currentState;
    }

    const initialUpdate: Partial<TypeormSyncResult<InstanceType<ModelType>>> = {};
    if (fetchClient) {
        initialUpdate.isClientLoading = true;
    }
    if (fetchServer) {
        initialUpdate.isServerLoading = true;
    }
    updateResult([modelId, query], initialUpdate);

    const resultPromise = new PromiseWithHandlers<TypeormSyncResult<InstanceType<ModelType>>>();
    let foundFromServer = false;
    await repository.findAndSync({
        ...query,
        runOnServer: fetchServer,
        runOnClient: fetchClient,
        callback: (foundModels, fromServer) => {
            if (fromServer || !fetchServer) {
                foundFromServer = true;
                resultPromise.resolve({
                    entities: foundModels,
                    isServerResult: fromServer,
                    clientError: undefined,
                    serverError: undefined,
                    isServerLoading: false,
                    isClientLoading: false,
                });
            } else if (!foundFromServer) {
                updateResult([modelId, query], {
                    entities: foundModels,
                    isServerResult: false,
                    clientError: undefined,
                    isClientLoading: false,
                });
            }
        },
        errorCallback: (error, fromServer) => {
            if (foundFromServer && !fromServer) {
                return;
            }

            const update = fromServer
                ? {
                      serverError: error,
                      isServerLoading: false,
                  }
                : {
                      clientError: error,
                      isClientLoading: false,
                  };
            updateResult([modelId, query], update);

            if (fromServer || !fetchServer) {
                resultPromise.reject(error);
            }
        },
    });

    return resultPromise;
}
