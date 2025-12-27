type DefinedValueType = 'Function' | 'Variable';

interface DefinedValue {
  name: string;
  args?: string[];
  doc: string;
  valueType: DefinedValueType;
}

interface Diagnostic {
  startLine: number,
  startColumn: number,
  endLine: number,
  endColumn: number,
  message: string,
}

interface Options {
    isUpdate: boolean,
    inputFormat: 'markdown' | 'text' | 'mdx' | 'html' | 'null' | 'raw' | null,
    listStyle: 'dash' | 'plus' | 'star' | null,
    linkTitleStyle: 'double' | 'single' | 'paren' | null,
    linkUrlStyle: 'angle' | 'none' | null,
}



declare class ConversionOptions {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  extract_scripts_as_code_blocks: boolean;
  generate_front_matter: boolean;
  use_title_as_h1: boolean;
}

/**
 * Run an mq
 */
declare function run(code: string, content: string, options?: Partial<Options>): Promise<string>;
/**
 * Convert mq code to its AST (Abstract Syntax Tree) representation.
 */
declare function toAst(code: string): Promise<string>;
/**
 * Format mq code
 */
declare function format(code: string): Promise<string>;
/**
 * Get diagnostics for mq code
 */
declare function diagnostics(code: string): Promise<ReadonlyArray<Diagnostic>>;
/**
 * Get defined values from mq code
 */
declare function definedValues(code: string, module?: string): Promise<ReadonlyArray<DefinedValue>>;
/**
 * Converts HTML input to Markdown
 */
declare function htmlToMarkdown(html: string, options?: ConversionOptions): Promise<string>;
/**
 * Markdown Input to HTML
 */
declare function toHtml(markdownInput: string): Promise<string>;

export { definedValues, diagnostics, format, htmlToMarkdown, run, toAst, toHtml };
