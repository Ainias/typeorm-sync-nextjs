import { create } from 'zustand';
import { Database, SyncModel } from '@ainias42/typeorm-sync';
import { fetchQuery, TypeormSyncKey } from '../hooks/fetchQuery/fetchQuery';
import { JsonHelper } from '@ainias42/js-helper';
import { updateResult } from '../hooks/fetchQuery/updateResult';

const initialState = {
    triggers: {} as Record<number, TypeormSyncKey<typeof SyncModel>[]>,
    triggerTimeouts: {} as Record<number, ReturnType<typeof setTimeout>>,
};

export type TypeormSyncStoreState = typeof initialState & ReturnType<typeof actionsGenerator>;

type SetState = (
    newState:
        | TypeormSyncStoreState
        | Partial<TypeormSyncStoreState>
        | ((state: TypeormSyncStoreState) => TypeormSyncStoreState | Partial<TypeormSyncStoreState>),
    replace?: boolean
) => void;
type GetState = () => Readonly<TypeormSyncStoreState>;
const actionsGenerator = (set: SetState, get: GetState) => ({
    clear() {
        set({ ...actionsGenerator(set, get) }, true);
    },
    setTriggeringEntities<ModelType extends typeof SyncModel>(
        queryKey: TypeormSyncKey<ModelType>,
        models: (typeof SyncModel)[]
    ) {
        const { triggers } = get();
        models.forEach((model) => {
            const modelId = Database.getModelIdFor(model);
            triggers[modelId] = triggers[modelId] ?? [];
            if (!triggers[modelId].find((item) => JsonHelper.deepEqual(item, queryKey))) {
                triggers[modelId].push(queryKey as TypeormSyncKey<typeof SyncModel>);
            }
        });
    },
    trigger(modelId: number) {
        const { triggers, triggerTimeouts } = get();

        if (triggerTimeouts[modelId]) {
            return;
        }
        const timeout = setTimeout(() => {
            triggers[modelId]?.forEach((queryKey) => {
                fetchQuery(queryKey, true, false).then((result) => {
                    updateResult(queryKey, result);
                });
            });
            set((old) => {
                const oldTriggerTimeouts = { ...old.triggerTimeouts };
                delete oldTriggerTimeouts[modelId];
                return { triggerTimeouts: oldTriggerTimeouts };
            });
        }, 1000);
        set({ triggerTimeouts: { ...triggerTimeouts, [modelId]: timeout } });
    },
});

export const useTypeormSyncCache = create<TypeormSyncStoreState>((set, get) => ({
    ...initialState,
    ...actionsGenerator(set, get),
}));
