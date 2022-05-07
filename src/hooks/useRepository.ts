import { Database, waitForSyncRepository, SyncModel, SyncRepository } from 'typeorm-sync';
import { useEffect, useState } from 'react';

export function useRepository<T extends typeof SyncModel>(model: T) {
    const [repository, setRepository] = useState<undefined | SyncRepository<T>>();
    useEffect(() => {
        Database.waitForInstance().then(async () => {
            setRepository(await waitForSyncRepository(model));
        });
    }, [model]);
    return repository;
}
