import { EntitySubscriberInterface, InsertEvent, RecoverEvent, RemoveEvent, SoftRemoveEvent, UpdateEvent } from 'typeorm';
export declare class ChangeSubscriber implements EntitySubscriberInterface {
    private trigger;
    /**
     * Called after entity insertion.
     */
    afterInsert(event: InsertEvent<any>): void;
    /**
     * Called after entity update.
     */
    afterUpdate(event: UpdateEvent<any>): void;
    /**
     * Called after entity removal.
     */
    afterRemove(event: RemoveEvent<any>): void;
    /**
     * Called after entity removal.
     */
    afterSoftRemove(event: SoftRemoveEvent<any>): void;
    /**
     * Called after entity recovery.
     */
    afterRecover(event: RecoverEvent<any>): void;
}
