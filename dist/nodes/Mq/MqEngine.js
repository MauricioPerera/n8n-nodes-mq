"use strict";
/**
 * MqEngine - Node.js wrapper for mq-web WASM module
 *
 * mq-web is designed for browsers and uses fetch to load its WASM file.
 * This wrapper patches fetch to work in Node.js by loading the WASM
 * file from the filesystem.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
exports.format = format;
exports.diagnostics = diagnostics;
exports.toAst = toAst;
exports.definedValues = definedValues;
const fs_1 = require("fs");
const path_1 = require("path");
let mqModule = null;
let initPromise = null;
let wasmInitialized = false;
let wasmBuffer = null;
let originalFetch = null;
/**
 * Setup fetch patch for WASM loading
 */
function setupFetchPatch() {
    if (originalFetch)
        return; // Already patched
    // Find the WASM file
    const possiblePaths = [
        (0, path_1.join)(__dirname, '../../node_modules/mq-web/dist/mq_wasm_bg.wasm'),
        (0, path_1.join)(__dirname, '../../../node_modules/mq-web/dist/mq_wasm_bg.wasm'),
        (0, path_1.join)((0, path_1.dirname)(require.resolve('mq-web')), 'mq_wasm_bg.wasm'),
    ];
    for (const wasmPath of possiblePaths) {
        try {
            wasmBuffer = (0, fs_1.readFileSync)(wasmPath);
            break;
        }
        catch {
            continue;
        }
    }
    if (!wasmBuffer) {
        throw new Error('Could not find mq_wasm_bg.wasm file');
    }
    // Store original fetch and patch it
    originalFetch = globalThis.fetch;
    // @ts-ignore
    globalThis.fetch = async (input, init) => {
        const url = String(input);
        if (url.includes('mq_wasm_bg.wasm') || url.endsWith('.wasm')) {
            return new Response(wasmBuffer, {
                status: 200,
                headers: { 'Content-Type': 'application/wasm' },
            });
        }
        return originalFetch(input, init);
    };
}
/**
 * Initialize the mq WASM module for Node.js
 */
async function initMq() {
    if (mqModule && wasmInitialized) {
        return mqModule;
    }
    if (initPromise) {
        await initPromise;
        return mqModule;
    }
    initPromise = (async () => {
        setupFetchPatch();
        const mq = await Promise.resolve().then(() => __importStar(require('mq-web')));
        mqModule = mq;
    })();
    await initPromise;
    return mqModule;
}
/**
 * Ensure WASM is loaded
 */
async function ensureWasmLoaded() {
    if (wasmInitialized)
        return;
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
async function run(query, content, options) {
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
async function format(query) {
    await ensureWasmLoaded();
    const mq = await initMq();
    return mq.format(query);
}
/**
 * Get diagnostics for an mq query
 */
async function diagnostics(query) {
    await ensureWasmLoaded();
    const mq = await initMq();
    return mq.diagnostics(query);
}
/**
 * Get the AST of an mq query
 */
async function toAst(query) {
    await ensureWasmLoaded();
    const mq = await initMq();
    return mq.toAst(query);
}
/**
 * Get defined values from an mq query
 */
async function definedValues(query, module) {
    await ensureWasmLoaded();
    const mq = await initMq();
    return mq.definedValues(query, module);
}
//# sourceMappingURL=MqEngine.js.map