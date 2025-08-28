import { JsTransformerConfig, JsTransformOptions, TransformResponse } from "metro-transform-worker";
interface TransformerConfig extends JsTransformerConfig {
    cssInterop_transformerPath?: string;
    cssInterop_outputDirectory: string;
}
export declare function transform(config: TransformerConfig, projectRoot: string, filename: string, data: Buffer, options: JsTransformOptions): Promise<TransformResponse>;
export {};
