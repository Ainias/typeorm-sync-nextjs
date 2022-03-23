import { SyncEntity, SyncOptions } from 'typeorm-client-sync';
import { useState, useEffect } from 'react';
import { FindManyOptions } from 'typeorm';

export function useFind<EntityType extends typeof SyncEntity>(
    entity: EntityType,
    options: SyncOptions<FindManyOptions<EntityType>>,
    dependencies: any[] = []
) {
    const [models, setModels] = useState<EntityType[]>();
    useEffect(() => {
        let isCurrentRequest = true;
        entity.findWithCallback({
            ...options,
            callback: (foundModels: EntityType[]) => {
                if (isCurrentRequest) {
                    setModels(foundModels);
                }
            },
        });
        return () => (isCurrentRequest = false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entity, ...dependencies]);
    return models;
}
