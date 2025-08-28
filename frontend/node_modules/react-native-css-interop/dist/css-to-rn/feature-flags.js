"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFeatureFlags = exports.featureFlags = void 0;
exports.isFeatureEnabled = isFeatureEnabled;
const package_json_1 = __importDefault(require("react-native/package.json"));
const semver_1 = __importDefault(require("semver"));
exports.featureFlags = {
    transformPercentagePolyfill: "<0.75",
    disableGapPercentageValues: "<0.75",
    disableDisplayBlock: "<0.74",
    disableAlignContentEvenly: "<0.74",
    disablePositionStatic: "<0.74",
};
exports.defaultFeatureFlags = Object.fromEntries(Object.keys(exports.featureFlags).map((flag) => {
    return [flag, isFeatureEnabled(flag)];
}));
function isFeatureEnabled(key) {
    return semver_1.default.satisfies(package_json_1.default.version, exports.featureFlags[key]);
}
//# sourceMappingURL=feature-flags.js.map