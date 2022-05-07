"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRepository = void 0;
const typeorm_sync_1 = require("typeorm-sync");
const react_1 = require("react");
function useRepository(model) {
    const [repository, setRepository] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        typeorm_sync_1.Database.waitForInstance().then(() => __awaiter(this, void 0, void 0, function* () {
            setRepository(yield (0, typeorm_sync_1.waitForSyncRepository)(model));
        }));
    }, [model]);
    return repository;
}
exports.useRepository = useRepository;
//# sourceMappingURL=useRepository.js.map