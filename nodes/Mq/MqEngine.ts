/**
 * MqEngine - Node.js wrapper for mq-web WASM module
 *
 * The mq-web WASM module is bundled directly in this package to avoid
 * runtime dependencies, which are not allowed for verified n8n community nodes.
 * The WASM binary is inlined as base64 to avoid file system operations.
 */

import { getWasmBuffer } from './wasm-data';

// Type definitions for mq-web
interface MqModule {
  run: (query: string, content: string, options?: MqRunOptions) => Promise<string>;
  format: (query: string) => Promise<string>;
  diagnostics: (query: string) => Promise<MqDiagnostic[]>;
  toAst: (query: string) => Promise<string>;
  definedValues: (query: string, module?: string) => Promise<MqDefinedValue[]>;
  initSync: (options: { module: Uint8Array }) => void;
}

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

let mqModule: MqModule | null = null;
let wasmInitialized = false;

/**
 * Initialize the mq WASM module for Node.js using initSync
 */
function initMqSync(): MqModule {
  if (mqModule && wasmInitialized) {
    return mqModule;
  }

  // Get the WASM buffer from inlined base64 data
  const wasmBuffer = getWasmBuffer();

  // Load the mq-web module
  const mq = require('./wasm/index.cjs') as MqModule;

  // Initialize synchronously with the WASM buffer
  mq.initSync({ module: wasmBuffer });

  mqModule = mq;
  wasmInitialized = true;

  return mqModule;
}

/**
 * Get the initialized mq module
 */
function getMq(): MqModule {
  if (!mqModule || !wasmInitialized) {
    return initMqSync();
  }
  return mqModule;
}

/**
 * Run an mq query on markdown content
 */
export async function run(
  query: string,
  content: string,
  options?: MqRunOptions,
): Promise<string> {
  const mq = getMq();
  return mq.run(query, content, {
    isUpdate: false,
    inputFormat: 'markdown',
    listStyle: 'dash',
    linkUrlStyle: 'none',
    linkTitleStyle: 'paren',
    ...options,
  });
}

/**
 * Format an mq query
 */
export async function format(query: string): Promise<string> {
  const mq = getMq();
  return mq.format(query);
}

/**
 * Get diagnostics for an mq query
 */
export async function diagnostics(query: string): Promise<MqDiagnostic[]> {
  const mq = getMq();
  return mq.diagnostics(query);
}

/**
 * Get the AST of an mq query
 */
export async function toAst(query: string): Promise<string> {
  const mq = getMq();
  return mq.toAst(query);
}

/**
 * Get defined values from an mq query
 */
export async function definedValues(
  query: string,
  module?: string,
): Promise<MqDefinedValue[]> {
  const mq = getMq();
  return mq.definedValues(query, module);
}
