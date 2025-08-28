"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bgWhite = exports.bgCyan = exports.bgMagenta = exports.bgBlue = exports.bgYellow = exports.bgGreen = exports.bgRed = exports.bgBlack = exports.gray = exports.white = exports.cyan = exports.purple = exports.magenta = exports.blue = exports.yellow = exports.green = exports.red = exports.black = exports.strikethrough = exports.hidden = exports.inverse = exports.underline = exports.italic = exports.dim = exports.bold = exports.reset = void 0;
const { env, stdout } = globalThis?.process ?? {};
const enabled = env &&
    !env.NO_COLOR &&
    (env.FORCE_COLOR || (stdout?.isTTY && !env.CI && env.TERM !== "dumb"));
const replaceClose = (str, close, replace, index) => {
    const start = str.substring(0, index) + replace;
    const end = str.substring(index + close.length);
    const nextIndex = end.indexOf(close);
    return ~nextIndex
        ? start + replaceClose(end, close, replace, nextIndex)
        : start + end;
};
const formatter = (open, close, replace = open) => {
    if (!enabled)
        return String;
    return (input) => {
        const string = "" + input;
        const index = string.indexOf(close, open.length);
        return ~index
            ? open + replaceClose(string, close, replace, index) + close
            : open + string + close;
    };
};
exports.reset = enabled ? (s) => `\x1b[0m${s}\x1b[0m` : String;
exports.bold = formatter("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m");
exports.dim = formatter("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m");
exports.italic = formatter("\x1b[3m", "\x1b[23m");
exports.underline = formatter("\x1b[4m", "\x1b[24m");
exports.inverse = formatter("\x1b[7m", "\x1b[27m");
exports.hidden = formatter("\x1b[8m", "\x1b[28m");
exports.strikethrough = formatter("\x1b[9m", "\x1b[29m");
exports.black = formatter("\x1b[30m", "\x1b[39m");
exports.red = formatter("\x1b[31m", "\x1b[39m");
exports.green = formatter("\x1b[32m", "\x1b[39m");
exports.yellow = formatter("\x1b[33m", "\x1b[39m");
exports.blue = formatter("\x1b[34m", "\x1b[39m");
exports.magenta = formatter("\x1b[35m", "\x1b[39m");
exports.purple = formatter("\x1b[38;2;173;127;168m", "\x1b[39m");
exports.cyan = formatter("\x1b[36m", "\x1b[39m");
exports.white = formatter("\x1b[37m", "\x1b[39m");
exports.gray = formatter("\x1b[90m", "\x1b[39m");
exports.bgBlack = formatter("\x1b[40m", "\x1b[49m");
exports.bgRed = formatter("\x1b[41m", "\x1b[49m");
exports.bgGreen = formatter("\x1b[42m", "\x1b[49m");
exports.bgYellow = formatter("\x1b[43m", "\x1b[49m");
exports.bgBlue = formatter("\x1b[44m", "\x1b[49m");
exports.bgMagenta = formatter("\x1b[45m", "\x1b[49m");
exports.bgCyan = formatter("\x1b[46m", "\x1b[49m");
exports.bgWhite = formatter("\x1b[47m", "\x1b[49m");
//# sourceMappingURL=picocolors.js.map