"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFind = void 0;
const typeorm_sync_1 = require("typeorm-sync");
const react_1 = require("react");
function useFind(model, options, dependencies = []) {
    const [models, setModels] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        let isCurrentRequest = true;
        const repository = (0, typeorm_sync_1.getSyncRepository)(model);
        repository.findWithCallback(Object.assign(Object.assign({}, options), { callback: (foundModels) => {
                if (isCurrentRequest) {
                    setModels(foundModels);
                }
            } }));
        return () => (isCurrentRequest = false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model, ...dependencies]);
    return models;
}
exports.useFind = useFind;
//# sourceMappingURL=useFind.js.map