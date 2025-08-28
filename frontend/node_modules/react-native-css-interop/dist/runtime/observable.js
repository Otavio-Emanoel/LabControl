"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observable = observable;
exports.cleanupEffect = cleanupEffect;
function observable(value, { fallback, name } = {}) {
    const effects = new Set();
    return {
        name,
        get(effect) {
            if (effect) {
                effects.add(effect);
                effect.dependencies.add(() => effects.delete(effect));
            }
            return value ?? fallback?.get(effect);
        },
        set(newValue) {
            if (Object.is(newValue, value))
                return;
            value = newValue;
            for (const effect of Array.from(effects)) {
                effect.run();
            }
        },
    };
}
function cleanupEffect(effect) {
    for (const dep of Array.from(effect.dependencies)) {
        dep();
    }
    effect.dependencies.clear();
}
//# sourceMappingURL=observable.js.map