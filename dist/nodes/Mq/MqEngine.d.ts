/**
 * MqEngine - Node.js wrapper for mq-web WASM module
 *
 * The mq-web WASM module is bundled directly in this package to avoid
 * runtime dependencies, which are not allowed for verified n8n community nodes.
 */
export interface MqRunOptions {
    isUpdate?: boolean;
    inputFormat?: 'markdown' | 'mdx' | 'html';
    listStyle?: 'dash' | 'star' | 'plus';
    linkUrlStyle?: 'none' | 'inline' | 'reference';
    linkTitleStyle?: 'paren' | 'quote';
}
export interface MqDiagnostic {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    message: string;
    severity: string;
}
export interface MqDefinedValue {
    name: string;
    type: string;
    description?: string;
}
/**
 * Run an mq query on markdown content
 */
export declare function run(query: string, content: string, options?: MqRunOptions): Promise<string>;
/**
 * Format an mq query
 */
export declare function format(query: string): Promise<string>;
/**
 * Get diagnostics for an mq query
 */
export declare function diagnostics(query: string): Promise<MqDiagnostic[]>;
/**
 * Get the AST of an mq query
 */
export declare function toAst(query: string): Promise<string>;
/**
 * Get defined values from an mq query
 */
export declare function definedValues(query: string, module?: string): Promise<MqDefinedValue[]>;
//# sourceMappingURL=MqEngine.d.ts.map