export { definedValues, diagnostics, format, run, toAst } from './core.cjs';

/* tslint:disable */
/* eslint-disable */

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

export type { DefinedValue, DefinedValueType, Diagnostic, Options };
