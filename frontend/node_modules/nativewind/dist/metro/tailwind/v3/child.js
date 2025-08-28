"use strict";
(async function () {
    const fs = require("fs");
    const fakeOutput = "FAKE_OUTPUT";
    let currentContents = "";
    const originalReadFile = fs.promises.readFile;
    fs.promises.readFile = async (path, encoding) => {
        if (path === fakeOutput) {
            return currentContents;
        }
        return originalReadFile(path, encoding);
    };
    const originalMkdir = fs.promises.mkdir.bind(fs.promises.mkdir);
    fs.promises.mkdir = async (path, ...args) => {
        if (path === fakeOutput) {
            return;
        }
        return originalMkdir(path, ...args);
    };
    let previousData = "";
    fs.promises.writeFile = async (path, data, ...args) => {
        if (path !== fakeOutput) {
            throw new Error(`Tailwind CLI attempted to write file ${path}`);
        }
        if (!process.send) {
            process.exit(42);
        }
        const newData = data.toString();
        if (previousData !== newData) {
            previousData = newData;
            process.send(newData);
        }
        return;
    };
    const { build } = require("tailwindcss/lib/cli/build");
    const args = {
        "--input": process.env.NATIVEWIND_INPUT,
        "--output": fakeOutput,
    };
    if (process.env.NATIVEWIND_WATCH === "true") {
        args["--watch"] = true;
    }
    await build(args);
})();
//# sourceMappingURL=child.js.map