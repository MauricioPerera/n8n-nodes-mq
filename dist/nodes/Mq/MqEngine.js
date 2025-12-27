"use strict";
/**
 * MqEngine - Node.js wrapper for mq-web WASM module
 *
 * The mq-web WASM module is bundled directly in this package to avoid
 * runtime dependencies, which are not allowed for verified n8n community nodes.
 * The WASM binary is inlined as base64 to avoid file system operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.format = format;
exports.diagnostics = diagnostics;
exports.toAst = toAst;
exports.definedValues = definedValues;
const wasm_data_1 = require("./wasm-data");
let mqModule = null;
let wasmInitialized = false;
/**
 * Initialize the mq WASM module for Node.js using initSync
 */
function initMqSync() {
    if (mqModule && wasmInitialized) {
        return mqModule;
    }
    // Get the WASM buffer from inlined base64 data
    const wasmBuffer = (0, wasm_data_1.getWasmBuffer)();
    // Load the mq-web module
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