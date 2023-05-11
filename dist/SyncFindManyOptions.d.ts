import { FindManyOptions } from 'typeorm';
export type SyncFindManyOptions<Entity> = FindManyOptions<Entity> & {
    relations?: string[];
};
