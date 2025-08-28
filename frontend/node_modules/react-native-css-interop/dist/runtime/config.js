"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNormalizeConfig = getNormalizeConfig;
function getNormalizeConfig(mapping) {
    const configs = [];
    for (const [source, options] of Object.entries(mapping)) {
        let target;
        let inlineProp;
        let propToRemove;
        let nativeStyleToProp;
        if (!options)
            continue;
        if (options === true) {
            target = [source];
        }
        else if (typeof options === "string") {
            target = [options];
        }
        else if (options.target === false) {
            target = [source];
            propToRemove = source;
            nativeStyleToProp = parseNativeStyleToProp(options.nativeStyleToProp);
        }
        else {
            target = options.target === true ? [source] : options.target.split(".");
            nativeStyleToProp = parseNativeStyleToProp(options.nativeStyleToProp);
        }
        if (target.length === 1 && target[0] !== source) {
            inlineProp = target[0];
        }
        configs.push({
            nativeStyleToProp,
            source,
            target,
            inlineProp,
            propToRemove,
        });
    }
    return configs;
}
function parseNativeStyleToProp(nativeStyleToProp) {
    if (!nativeStyleToProp)
        return;
    return Object.entries(nativeStyleToProp).map(([key, value]) => {
        return [key, value === true ? [key] : value.split(".")];
    });
}
//# sourceMappingURL=config.js.map