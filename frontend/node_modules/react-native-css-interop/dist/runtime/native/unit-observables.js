"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vh = exports.vw = exports.INTERNAL_RESET = exports.rem = void 0;
const react_native_1 = require("react-native");
const shared_1 = require("../../shared");
const observable_1 = require("../observable");
exports.rem = (0, observable_1.observable)(14);
var shared_2 = require("../../shared");
Object.defineProperty(exports, "INTERNAL_RESET", { enumerable: true, get: function () { return shared_2.INTERNAL_RESET; } });
const viewport = (0, observable_1.observable)(react_native_1.Dimensions.get("window"), { name: "viewport" });
let windowEventSubscription;
const viewportReset = (dimensions) => {
    viewport.set(dimensions.get("window"));
    windowEventSubscription?.remove();
    windowEventSubscription = dimensions.addEventListener("change", (size) => {
        return viewport.set(size.window);
    });
};
viewportReset(react_native_1.Dimensions);
exports.vw = {
    get: (effect) => viewport.get(effect).width,
    [shared_1.INTERNAL_RESET]: viewportReset,
    [shared_1.INTERNAL_SET](value) {
        const current = viewport.get();
        if (value !== current.width) {
            viewport.set({ ...current, width: value });
        }
    },
};
exports.vh = {
    get: (effect) => viewport.get(effect).height,
    [shared_1.INTERNAL_RESET]: viewportReset,
    [shared_1.INTERNAL_SET](value) {
        const current = viewport.get();
        if (value !== current.height) {
            viewport.set({ ...current, height: value });
        }
    },
};
//# sourceMappingURL=unit-observables.js.map