"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthandHandler = shorthandHandler;
const shared_1 = require("../../../shared");
const resolve_value_1 = require("../resolve-value");
const shared_2 = require("./shared");
function shorthandHandler(mappings, defaults) {
    const resolveFn = (resolve, state, refs, tracking, descriptor, style) => {
        if (!(0, shared_1.isDescriptorArray)(descriptor))
            return;
        const resolved = descriptor.flatMap((value) => {
            return resolve(state, refs, tracking, value, style);
        });
        const match = mappings.find((mapping) => {
            return mapping.every((map, index) => {
                const type = map[1];
                const value = resolved[index];
                switch (type) {
                    case "string":
                    case "number":
                        return typeof value === type;
                    case "color":
                        return typeof value === "string" || typeof value === "object";
                    case "length":
                        return typeof value === "string"
                            ? value.endsWith("%")
                            : typeof value === "number";
                }
            });
        });
        if (!match)
            return;
        const seenDefaults = new Set(defaults);
        const result = [
            ...match.map((map, index) => {
                if (map.length === 3) {
                    seenDefaults.delete(map);
                }
                return [map[0], resolved[index]];
            }),
            ...Array.from(seenDefaults).map((map) => {
                const value = resolve_value_1.defaultValues[map[2]];
                return [
                    map[0],
                    typeof value === "function" ? value(tracking.effect) : value,
                ];
            }),
        ];
        return Object.assign(result, { [shared_2.ShorthandSymbol]: true });
    };
    return resolveFn;
}
//# sourceMappingURL=shorthand.js.map