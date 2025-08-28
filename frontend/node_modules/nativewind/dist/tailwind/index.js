"use strict";
module.exports = Object.assign(() => {
    const isTailwindCSSIntelliSenseMode = "TAILWIND_MODE" in process.env;
    if (isTailwindCSSIntelliSenseMode)
        return require("./native").default;
    return process.env.NATIVEWIND_OS === undefined ||
        process.env.NATIVEWIND_OS === "web"
        ? require("./web").default
        : require("./native").default;
}, {
    nativewind: true,
});
//# sourceMappingURL=index.js.map