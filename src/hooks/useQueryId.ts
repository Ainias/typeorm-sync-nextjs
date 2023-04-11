import { useMemo } from 'react';
import { Database, SyncModel } from '@ainias42/typeorm-sync';
import { FindManyOptions } from 'typeorm';

export function useQueryId<ModelType extends typeof SyncModel>(
    model: ModelType,
    options: FindManyOptions<InstanceType<ModelType>>
) {
    return useMemo(() => `${Database.getModelIdFor(model)}-${JSON.stringify(options)}`, [model, options]);
}
