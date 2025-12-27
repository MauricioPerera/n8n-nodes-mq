"use strict";
/**
 * MqEngine - Node.js wrapper for mq-web WASM module
 *
 * The mq-web WASM module is bundled directly in this package to avoid
 * runtime dependencies, which are not allowed for verified n8n community nodes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.format = format;
exports.diagnostics = diagnostics;
exports.toAst = toAst;
exports.definedValues = definedValues;
const fs_1 = require("fs");
const path_1 = require("path");
let mqModule = null;
let wasmInitialized = false;
/**
 * Initialize the mq WASM module for Node.js using initSync
 */
function initMqSync() {
    if (mqModule && wasmInitialized) {
        return mqModule;
    }
    // Load the bundled WASM file
    const wasmPath = (0, path_1.join)(__dirname, 'wasm', 'mq_wasm_bg.wasm');
    let wasmBuffer;
    try {
        wasmBuffer = (0, fs_1.readFileSync)(wasmPath);
    }
    catch {
        throw new Error("Could not find bundled mq_wasm_bg.wasm file at " + wasmPath);
    }
    // Load the mq-web module
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mq = require('./wasm/index.cjs');
    // Initialize synchronously with the WASM buffer
    mq.initSync({ module: wasmBuffer });
    mqModule = mq;
    wasmInitialized = true;
    return mqModule;
}
/**
 * Get the initialized mq module
 */
function getMq() {
    if (!mqModule || !wasmInitialized) {
        return initMqSync();
    }
    return mqModule;
}
/**
 * Run an mq query on markdown content
 */
async function run(query, content, options) {
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
async function format(query) {
    const mq = getMq();
    return mq.format(query);
}
/**
 * Get diagnostics for an mq query
 */
async function diagnostics(query) {
    const mq = getMq();
    return mq.diagnostics(query);
}
/**
 * Get the AST of an mq query
 */
async function toAst(query) {
    const mq = getMq();
    return mq.toAst(query);
}
/**
 * Get defined values from an mq query
 */
async function definedValues(query, module) {
    const mq = getMq();
    return mq.definedValues(query, module);
}
//# sourceMappingURL=MqEngine.js.map