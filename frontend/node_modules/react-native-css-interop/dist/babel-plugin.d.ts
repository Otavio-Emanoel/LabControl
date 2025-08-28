import { NodePath } from "@babel/traverse";
import { Program } from "@babel/types";
export default function (): {
    name: string;
    visitor: {
        Program(path: NodePath<Program>, state: {
            filename: string;
        }): void;
    };
};
