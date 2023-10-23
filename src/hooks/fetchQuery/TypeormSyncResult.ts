import { SyncModel } from "@ainias42/typeorm-sync";

export type TypeormSyncResult<EntityType extends SyncModel> = {
    entities: EntityType[],
    isServerResult: boolean,
    serverError: any
    clientError: any
    isServerLoading: boolean
    isClientLoading: boolean

}
