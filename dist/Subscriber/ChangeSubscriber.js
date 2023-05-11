"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeSubscriber = void 0;
/* eslint-disable class-methods-use-this */
const typeorm_1 = require("typeorm");
const typeorm_sync_1 = require("@ainias42/typeorm-sync");
const useTypeormSyncCache_1 = require("../store/useTypeormSyncCache");
let ChangeSubscriber = class ChangeSubscriber {
    trigger(model) {
        if ((model === null || model === void 0 ? void 0 : model.prototype) instanceof typeorm_sync_1.SyncModel) {
            useTypeormSyncCache_1.useTypeormSyncCache.getState().trigger(typeorm_sync_1.Database.getModelIdFor(model));
        }
    }
    /**
     * Called after entity insertion.
     */
    afterInsert(event) {
        this.trigger(event.metadata.target);
    }
    /**
     * Called after entity update.
     */
    afterUpdate(event) {
        this.trigger(event.metadata.target);
    }
    /**
     * Called after entity removal.
     */
    afterRemove(event) {
        this.trigger(event.metadata.target);
    }
    /**
     * Called after entity removal.
     */
    afterSoftRemove(event) {
        this.trigger(event.metadata.target);
    }
    /**
     * Called after entity recovery.
     */
    afterRecover(event) {
        this.trigger(event.metadata.target);
    }
};
ChangeSubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], ChangeSubscriber);
exports.ChangeSubscriber = ChangeSubscriber;
//# sourceMappingURL=ChangeSubscriber.js.map