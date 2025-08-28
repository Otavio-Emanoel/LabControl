"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const helper_module_imports_1 = require("@babel/helper-module-imports");
const types_1 = require("@babel/types");
const importFunction = "createInteropElement";
const importModule = "react-native-css-interop";
const importAs = "ReactNativeCSSInterop";
const allowedFileRegex = /^(?!.*[\/\\](react|react-native|react-native-web|react-native-css-interop)[\/\\]).*$/;
function default_1() {
    return {
        name: "react-native-css-interop-imports",
        visitor: {
            Program(path, state) {
                if (allowedFileRegex.test(state.filename)) {
                    let newExpression = null;
                    const insertImportStatement = () => {
                        if (newExpression === null) {
                            const importAsIdentifier = (0, helper_module_imports_1.addNamespace)(path, importModule, {
                                nameHint: importAs,
                            });
                            newExpression = (0, types_1.memberExpression)(importAsIdentifier, (0, types_1.identifier)(importFunction));
                        }
                        return newExpression;
                    };
                    path.traverse(visitor, { ...state, insertImportStatement });
                }
            },
        },
    };
}
const visitor = {
    MemberExpression(path, state) {
        if ((0, types_1.isIdentifier)(path.node.property, { name: "createElement" })) {
            let shouldReplace = false;
            if ((0, types_1.isIdentifier)(path.node.object, { name: "react" }) ||
                (0, types_1.isIdentifier)(path.node.object, { name: "React" })) {
                shouldReplace = isImportedFromReact(path.scope.getBinding(path.node.object.name));
            }
            else if ((0, types_1.isMemberExpression)(path.node.object) &&
                (0, types_1.isIdentifier)(path.node.object.object, { name: "_react" }) &&
                (0, types_1.isIdentifier)(path.node.object.property, { name: "default" })) {
                shouldReplace = isImportedFromReact(path.scope.getBinding(path.node.object.object.name));
            }
            if (!shouldReplace)
                return;
            const newExpression = state.insertImportStatement();
            path.replaceWith(newExpression);
        }
    },
    Identifier(path, state) {
        if (path.node.name === "createElement" &&
            path.parentPath.isCallExpression() &&
            isImportedFromReact(path.scope.getBinding("createElement"))) {
            const newExpression = state.insertImportStatement();
            path.replaceWith(newExpression);
        }
    },
};
function isImportedFromReact(binding) {
    const path = binding?.path;
    if (!path) {
        return false;
    }
    else if (path.isImportSpecifier() ||
        path.isImportDefaultSpecifier() ||
        path.isImportDeclaration() ||
        path.isImportNamespaceSpecifier()) {
        return ((0, types_1.isImportDeclaration)(path.parentPath.node) &&
            path.parentPath.node.source.value.toLowerCase() === "react");
    }
    else if (path.isVariableDeclarator() && (0, types_1.isCallExpression)(path.node.init)) {
        if ((0, types_1.isIdentifier)(path.node.init.callee, { name: "require" }) &&
            (0, types_1.isStringLiteral)(path.node.init.arguments[0], { value: "react" })) {
            return true;
        }
        else if ((0, types_1.isIdentifier)(path.node.init.callee, { name: "_interopRequireDefault" }) &&
            (0, types_1.isCallExpression)(path.node.init.arguments[0]) &&
            (0, types_1.isIdentifier)(path.node.init.arguments[0].callee, { name: "require" }) &&
            (0, types_1.isStringLiteral)(path.node.init.arguments[0].arguments[0], {
                value: "react",
            })) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=babel-plugin.js.map