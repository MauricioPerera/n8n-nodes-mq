/**
 * MqEngine - Node.js wrapper for mq-web WASM module
 *
 * mq-web is designed for browsers and uses fetch to load its WASM file.
 * This wrapper patches fetch to work in Node.js by loading the WASM
 * file from the filesystem.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';

// Type definitions for mq-web
interface MqModule {
  run: (query: string, content: string, options?: MqRunOptions) => Promise<string>;
  format: (query: string) => Promise<string>;
  diagnostics: (query: string) => Promise<MqDiagnostic[]>;
  toAst: (query: string) => Promise<string>;
  definedValues: (query: string, module?: string) => Promise<MqDefinedValue[]>;
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
let initPromise: Promise<void> | null = null;
let wasmInitialized = false;
let wasmBuffer: Buffer | null = null;
let originalFetch: typeof fetch | null = null;

/**
 * Setup fetch patch for WASM loading
 */
function setupFetchPatch(): void {
  if (originalFetch) return; // Already patched

  // Find the WASM file
  const possiblePaths = [
    join(__dirname, '../../node_modules/mq-web/dist/mq_wasm_bg.wasm'),
    join(__dirname, '../../../node_modules/mq-web/dist/mq_wasm_bg.wasm'),
    join(dirname(require.resolve('mq-web')), 'mq_wasm_bg.wasm'),
  ];

  for (const wasmPath of possiblePaths) {
    try {
      wasmBuffer = readFileSync(wasmPath);
      break;
    } catch {
      continue;
    }
  }

  if (!wasmBuffer) {
    throw new Error('Could not find mq_wasm_bg.wasm file');
  }

  // Store original fetch and patch it
  originalFetch = globalThis.fetch;

  // @ts-ignore
  globalThis.fetch = async (input: unknown, init?: unknown) => {
    const url = String(input);

    if (url.includes('mq_wasm_bg.wasm') || url.endsWith('.wasm')) {
      return new Response(wasmBuffer!, {
        status: 200,
        headers: { 'Content-Type': 'application/wasm' },
      });
    }

    return originalFetch!(input as Parameters<typeof fetch>[0], init as Parameters<typeof fetch>[1]);
  };
}

/**
 * Initialize the mq WASM module for Node.js
 */
async function initMq(): Promise<MqModule> {
  if (mqModule && wasmInitialized) {
    return mqModule;
  }

  if (initPromise) {
    await initPromise;
    return mqModule!;
  }

  initPromise = (async () => {
    setupFetchPatch();
    const mq = await import('mq-web');
    mqModule = mq as unknown as MqModule;
  })();

  await initPromise;
  return mqModule!;
}

/**
 * Ensure WASM is loaded
 */
async function ensureWasmLoaded(): Promise<void> {
  if (wasmInitialized) return;

  const mq = await initMq();
  await mq.format('.h');
  wasmInitialized = true;

  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }
}

/**
 * Run an mq query on markdown content
 */
export async function run(
  query: string,
  content: string,
  options?: MqRunOptions,
): Promise<string> {
  await ensureWasmLoaded();
  const mq = await initMq();
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
  await ensureWasmLoaded();
  const mq = await initMq();
  return mq.format(query);
}

/**
 * Get diagnostics for an mq query
 */
export async function diagnostics(query: string): Promise<MqDiagnostic[]> {
  await ensureWasmLoaded();
  const mq = await initMq();
  return mq.diagnostics(query);
}

/**
 * Get the AST of an mq query
 */
export async function toAst(query: string): Promise<string> {
  await ensureWasmLoaded();
  const mq = await initMq();
  return mq.toAst(query);
}

/**
 * Get defined values from an mq query
 */
export async function definedValues(
  query: string,
  module?: string,
): Promise<MqDefinedValue[]> {
  await ensureWasmLoaded();
  const mq = await initMq();
  return mq.definedValues(query, module);
}
