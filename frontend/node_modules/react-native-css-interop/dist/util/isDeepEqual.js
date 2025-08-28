"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeepEqual = isDeepEqual;
function isDeepEqual(a, b) {
    const aArray = Array.isArray(a);
    const bArray = Array.isArray(b);
    const requiresKeyComparison = typeof a === "object" && typeof b === "object" && aArray === bArray;
    if (!requiresKeyComparison)
        return a === b;
    if (!a || !b) {
        return a === b;
    }
    if (aArray && bArray && a.length !== b.length) {
        return false;
    }
    for (const key in a) {
        if (!isDeepEqual(a[key], b[key])) {
            return false;
        }
    }
    for (const key in b) {
        if (!(key in a)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=isDeepEqual.js.map