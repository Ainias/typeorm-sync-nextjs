import { FindOneOptions } from 'typeorm';

export type SyncFindOneOptions<Entity> = FindOneOptions<Entity> & { relations?: string[] };
