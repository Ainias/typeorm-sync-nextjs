/* eslint-disable class-methods-use-this */
import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RecoverEvent,
    RemoveEvent,
    SoftRemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { Database, SyncModel } from '@ainias42/typeorm-sync';
import { useTypeormSyncCache } from '../store/useTypeormSyncCache';

@EventSubscriber()
export class ChangeSubscriber implements EntitySubscriberInterface {
    private trigger(model: any) {
        if (model?.prototype instanceof SyncModel) {
            useTypeormSyncCache.getState().trigger(Database.getModelIdFor(model));
        }
    }

    /**
     * Called after entity insertion.
     */
    afterInsert(event: InsertEvent<any>) {
        this.trigger(event.metadata.target);
    }

    /**
     * Called after entity update.
     */
    afterUpdate(event: UpdateEvent<any>) {
        this.trigger(event.metadata.target);
    }

    /**
     * Called after entity removal.
     */
    afterRemove(event: RemoveEvent<any>) {
        this.trigger(event.metadata.target);
    }

    /**
     * Called after entity removal.
     */
    afterSoftRemove(event: SoftRemoveEvent<any>) {
        this.trigger(event.metadata.target);
    }

    /**
     * Called after entity recovery.
     */
    afterRecover(event: RecoverEvent<any>) {
        this.trigger(event.metadata.target);
    }
}
