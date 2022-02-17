import { Interpreter } from './snippets/dioxus-interpreter-js-65fda9c09faa6be6/src/interpreter.js';

let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let WASM_VECTOR_LEN = 0;

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;

            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_36(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hbd86f244a7e425f6(arg0, arg1, addHeapObject(arg2));
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
function __wbg_adapter_39(arg0, arg1, arg2) {
    try {
        wasm._dyn_core__ops__function__FnMut___A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8037f43a755596d0(arg0, arg1, addBorrowedObject(arg2));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

function __wbg_adapter_42(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h162b3ffce4dd3fa3(arg0, arg1);
}

function __wbg_adapter_45(arg0, arg1, arg2) {
    try {
        wasm._dyn_core__ops__function__FnMut___A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd5a732313e45a142(arg0, arg1, addBorrowedObject(arg2));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

function __wbg_adapter_48(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__haca31d44c6a811fb(arg0, arg1, addHeapObject(arg2));
}

function getCachedStringFromWasm0(ptr, len) {
    if (ptr === 0) {
        return getObject(len);
    } else {
        return getStringFromWasm0(ptr, len);
    }
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('index-a3e9a9dcc156b059_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_json_serialize = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = JSON.stringify(obj === undefined ? null : obj);
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_693216e109162396 = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_09919627ac0992f5 = function(arg0, arg1) {
        var v0 = getCachedStringFromWasm0(arg0, arg1);
    if (arg0 !== 0) { wasm.__wbindgen_free(arg0, arg1); }
    console.error(v0);
};
imports.wbg.__wbindgen_number_new = function(arg0) {
    var ret = arg0;
    return addHeapObject(ret);
};
imports.wbg.__wbg_new_ee12ee5aa8a3eb0f = function(arg0) {
    var ret = new Interpreter(takeObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbg_setnode_6a5babf67ef4ffab = function(arg0, arg1, arg2) {
    getObject(arg0).set_node(arg1 >>> 0, takeObject(arg2));
};
imports.wbg.__wbg_PushRoot_041cfd75c42ff383 = function(arg0, arg1, arg2) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    getObject(arg0).PushRoot(n0);
};
imports.wbg.__wbg_AppendChildren_fa92e562a136ed67 = function(arg0, arg1) {
    getObject(arg0).AppendChildren(arg1 >>> 0);
};
imports.wbg.__wbg_ReplaceWith_b232fa147a8f18b9 = function(arg0, arg1, arg2, arg3) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    getObject(arg0).ReplaceWith(n0, arg3 >>> 0);
};
imports.wbg.__wbg_InsertAfter_9c37e2d485cba758 = function(arg0, arg1, arg2, arg3) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    getObject(arg0).InsertAfter(n0, arg3 >>> 0);
};
imports.wbg.__wbg_InsertBefore_25eddd471eb57082 = function(arg0, arg1, arg2, arg3) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    getObject(arg0).InsertBefore(n0, arg3 >>> 0);
};
imports.wbg.__wbg_Remove_e2a6d208af48d358 = function(arg0, arg1, arg2) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    getObject(arg0).Remove(n0);
};
imports.wbg.__wbg_CreateTextNode_3aff9faa36197f39 = function(arg0, arg1, arg2, arg3) {
    u32CvtShim[0] = arg2;
    u32CvtShim[1] = arg3;
    const n0 = uint64CvtShim[0];
    getObject(arg0).CreateTextNode(takeObject(arg1), n0);
};
imports.wbg.__wbg_CreateElement_c274387c566ebb3d = function(arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    u32CvtShim[0] = arg3;
    u32CvtShim[1] = arg4;
    const n1 = uint64CvtShim[0];
    getObject(arg0).CreateElement(v0, n1);
};
imports.wbg.__wbg_CreateElementNs_44b93a045ad6921a = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    u32CvtShim[0] = arg3;
    u32CvtShim[1] = arg4;
    const n1 = uint64CvtShim[0];
    var v2 = getCachedStringFromWasm0(arg5, arg6);
    getObject(arg0).CreateElementNs(v0, n1, v2);
};
imports.wbg.__wbg_CreatePlaceholder_5a5b836fbb36319b = function(arg0, arg1, arg2) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    getObject(arg0).CreatePlaceholder(n0);
};
imports.wbg.__wbg_NewEventListener_064967bb1a156a04 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    u32CvtShim[0] = arg3;
    u32CvtShim[1] = arg4;
    const n1 = uint64CvtShim[0];
    getObject(arg0).NewEventListener(v0, n1, getObject(arg5));
};
imports.wbg.__wbg_RemoveEventListener_2e7985ef023a5a94 = function(arg0, arg1, arg2, arg3, arg4) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    getObject(arg0).RemoveEventListener(n0, v1);
};
imports.wbg.__wbg_SetText_b33974263772756b = function(arg0, arg1, arg2, arg3) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    getObject(arg0).SetText(n0, takeObject(arg3));
};
imports.wbg.__wbg_SetAttribute_e1e1c94da3f806e1 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    var v2 = getCachedStringFromWasm0(arg6, arg7);
    getObject(arg0).SetAttribute(n0, v1, takeObject(arg5), v2);
};
imports.wbg.__wbg_RemoveAttribute_abe516f672b2e2ce = function(arg0, arg1, arg2, arg3, arg4) {
    u32CvtShim[0] = arg1;
    u32CvtShim[1] = arg2;
    const n0 = uint64CvtShim[0];
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    getObject(arg0).RemoveAttribute(n0, v1);
};
imports.wbg.__wbg_clearTimeout_d8b36ad8fa330187 = typeof clearTimeout == 'function' ? clearTimeout : notDefined('clearTimeout');
imports.wbg.__wbg_setTimeout_290c28f3580809b6 = function() { return handleError(function (arg0, arg1) {
    var ret = setTimeout(getObject(arg0), arg1);
    return ret;
}, arguments) };
imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbindgen_is_string = function(arg0) {
    var ret = typeof(getObject(arg0)) === 'string';
    return ret;
};
imports.wbg.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    var ret = typeof(val) === 'object' && val !== null;
    return ret;
};
imports.wbg.__wbindgen_is_null = function(arg0) {
    var ret = getObject(arg0) === null;
    return ret;
};
imports.wbg.__wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};
imports.wbg.__wbindgen_boolean_get = function(arg0) {
    const v = getObject(arg0);
    var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};
imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};
imports.wbg.__wbg_get_2d1407dba3452350 = function(arg0, arg1) {
    var ret = getObject(arg0)[takeObject(arg1)];
    return addHeapObject(ret);
};
imports.wbg.__wbg_set_f1a4ac8f3a605b11 = function(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};
imports.wbg.__wbg_instanceof_Window_434ce1849eb4e0fc = function(arg0) {
    var ret = getObject(arg0) instanceof Window;
    return ret;
};
imports.wbg.__wbg_document_5edd43643d1060d9 = function(arg0) {
    var ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_location_11472bb76bf5bbca = function(arg0) {
    var ret = getObject(arg0).location;
    return addHeapObject(ret);
};
imports.wbg.__wbg_history_52cfc93c824e772b = function() { return handleError(function (arg0) {
    var ret = getObject(arg0).history;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_requestAnimationFrame_0c71cd3c6779a371 = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
    return ret;
}, arguments) };
imports.wbg.__wbg_requestIdleCallback_83096961d4f988d3 = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).requestIdleCallback(getObject(arg1));
    return ret;
}, arguments) };
imports.wbg.__wbg_fetch_427498e0ccea81f4 = function(arg0, arg1) {
    var ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};
imports.wbg.__wbg_createElement_d017b8d2af99bab9 = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var ret = getObject(arg0).createElement(v0);
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_getElementById_b30e88aff96f66a1 = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var ret = getObject(arg0).getElementById(v0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_instanceof_CompositionEvent_98c7ac3087e63202 = function(arg0) {
    var ret = getObject(arg0) instanceof CompositionEvent;
    return ret;
};
imports.wbg.__wbg_data_9562112603a9aa89 = function(arg0, arg1) {
    var ret = getObject(arg1).data;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_length_e7da05fb6ffe5b28 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};
imports.wbg.__wbg_item_089ff4ad320ffd34 = function(arg0, arg1) {
    var ret = getObject(arg0).item(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_instanceof_MouseEvent_e20234cd6f6ebeb5 = function(arg0) {
    var ret = getObject(arg0) instanceof MouseEvent;
    return ret;
};
imports.wbg.__wbg_screenX_04a681cd21c0ca9b = function(arg0) {
    var ret = getObject(arg0).screenX;
    return ret;
};
imports.wbg.__wbg_screenY_a78aa0201d03a4e8 = function(arg0) {
    var ret = getObject(arg0).screenY;
    return ret;
};
imports.wbg.__wbg_clientX_849ccdf456d662ac = function(arg0) {
    var ret = getObject(arg0).clientX;
    return ret;
};
imports.wbg.__wbg_clientY_1aaff30fe0cd0876 = function(arg0) {
    var ret = getObject(arg0).clientY;
    return ret;
};
imports.wbg.__wbg_ctrlKey_4e536bedb069129f = function(arg0) {
    var ret = getObject(arg0).ctrlKey;
    return ret;
};
imports.wbg.__wbg_shiftKey_cc93bd2f12bfcc9c = function(arg0) {
    var ret = getObject(arg0).shiftKey;
    return ret;
};
imports.wbg.__wbg_altKey_d24e3f7e465410ec = function(arg0) {
    var ret = getObject(arg0).altKey;
    return ret;
};
imports.wbg.__wbg_metaKey_0b396e35a4941247 = function(arg0) {
    var ret = getObject(arg0).metaKey;
    return ret;
};
imports.wbg.__wbg_button_a18f33eb55774d89 = function(arg0) {
    var ret = getObject(arg0).button;
    return ret;
};
imports.wbg.__wbg_buttons_974d3032e355335f = function(arg0) {
    var ret = getObject(arg0).buttons;
    return ret;
};
imports.wbg.__wbg_instanceof_Response_ea36d565358a42f7 = function(arg0) {
    var ret = getObject(arg0) instanceof Response;
    return ret;
};
imports.wbg.__wbg_json_4ab99130d1a5b3a9 = function() { return handleError(function (arg0) {
    var ret = getObject(arg0).json();
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_new_226d109446575877 = function() { return handleError(function () {
    var ret = new Headers();
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_newwithstrandinit_c07f0662ece15bc6 = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg0, arg1);
    var ret = new Request(v0, getObject(arg2));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_hostname_322e0d657b158bb4 = function(arg0, arg1) {
    var ret = getObject(arg1).hostname;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_new_4473c9af1cac368b = function() { return handleError(function (arg0, arg1) {
    var v0 = getCachedStringFromWasm0(arg0, arg1);
    var ret = new URL(v0);
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_instanceof_WheelEvent_4b1a05cbd5815664 = function(arg0) {
    var ret = getObject(arg0) instanceof WheelEvent;
    return ret;
};
imports.wbg.__wbg_deltaX_df228181f4d1a561 = function(arg0) {
    var ret = getObject(arg0).deltaX;
    return ret;
};
imports.wbg.__wbg_deltaY_afa6edde136e1500 = function(arg0) {
    var ret = getObject(arg0).deltaY;
    return ret;
};
imports.wbg.__wbg_deltaZ_30dcbd02ca271c39 = function(arg0) {
    var ret = getObject(arg0).deltaZ;
    return ret;
};
imports.wbg.__wbg_deltaMode_ed9d7974a0c11323 = function(arg0) {
    var ret = getObject(arg0).deltaMode;
    return ret;
};
imports.wbg.__wbg_instanceof_HtmlFormElement_f354651918394a94 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLFormElement;
    return ret;
};
imports.wbg.__wbg_elements_1def31c83e81f2a8 = function(arg0) {
    var ret = getObject(arg0).elements;
    return addHeapObject(ret);
};
imports.wbg.__wbg_instanceof_HtmlTextAreaElement_16f2c6ca1b8ccd65 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLTextAreaElement;
    return ret;
};
imports.wbg.__wbg_value_d3a30bc2c7caf357 = function(arg0, arg1) {
    var ret = getObject(arg1).value;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_instanceof_TransitionEvent_3a2d8321fec2d7c8 = function(arg0) {
    var ret = getObject(arg0) instanceof TransitionEvent;
    return ret;
};
imports.wbg.__wbg_propertyName_d092e58e9cc512c9 = function(arg0, arg1) {
    var ret = getObject(arg1).propertyName;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_elapsedTime_c9532b60001b7ab9 = function(arg0) {
    var ret = getObject(arg0).elapsedTime;
    return ret;
};
imports.wbg.__wbg_pseudoElement_fbd578e5f7b13974 = function(arg0, arg1) {
    var ret = getObject(arg1).pseudoElement;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_instanceof_AnimationEvent_8cf515b4164539c2 = function(arg0) {
    var ret = getObject(arg0) instanceof AnimationEvent;
    return ret;
};
imports.wbg.__wbg_animationName_adbb951bd855fd25 = function(arg0, arg1) {
    var ret = getObject(arg1).animationName;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_elapsedTime_2bfabf1ffd1449f6 = function(arg0) {
    var ret = getObject(arg0).elapsedTime;
    return ret;
};
imports.wbg.__wbg_pseudoElement_f440b49d6733a4f1 = function(arg0, arg1) {
    var ret = getObject(arg1).pseudoElement;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_instanceof_PointerEvent_7a157d9f2eb5fc33 = function(arg0) {
    var ret = getObject(arg0) instanceof PointerEvent;
    return ret;
};
imports.wbg.__wbg_pointerId_60c6c29cc58f32a9 = function(arg0) {
    var ret = getObject(arg0).pointerId;
    return ret;
};
imports.wbg.__wbg_width_2cc86e9ec447ca00 = function(arg0) {
    var ret = getObject(arg0).width;
    return ret;
};
imports.wbg.__wbg_height_1fe88e19b9767a03 = function(arg0) {
    var ret = getObject(arg0).height;
    return ret;
};
imports.wbg.__wbg_pressure_37cef495bc1ea47f = function(arg0) {
    var ret = getObject(arg0).pressure;
    return ret;
};
imports.wbg.__wbg_tangentialPressure_33f4ea2cd1cda77f = function(arg0) {
    var ret = getObject(arg0).tangentialPressure;
    return ret;
};
imports.wbg.__wbg_tiltX_3f463ec69e4f7b1f = function(arg0) {
    var ret = getObject(arg0).tiltX;
    return ret;
};
imports.wbg.__wbg_tiltY_c048ee33d0c56e13 = function(arg0) {
    var ret = getObject(arg0).tiltY;
    return ret;
};
imports.wbg.__wbg_twist_fdd6e53521038b9d = function(arg0) {
    var ret = getObject(arg0).twist;
    return ret;
};
imports.wbg.__wbg_pointerType_d791634374f3f4d4 = function(arg0, arg1) {
    var ret = getObject(arg1).pointerType;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_isPrimary_a34bca42dea9ee74 = function(arg0) {
    var ret = getObject(arg0).isPrimary;
    return ret;
};
imports.wbg.__wbg_instanceof_TouchEvent_6f8e0e90b91dcab3 = function(arg0) {
    var ret = getObject(arg0) instanceof TouchEvent;
    return ret;
};
imports.wbg.__wbg_altKey_a69529f01610f7e8 = function(arg0) {
    var ret = getObject(arg0).altKey;
    return ret;
};
imports.wbg.__wbg_metaKey_d76f860a7314b6c9 = function(arg0) {
    var ret = getObject(arg0).metaKey;
    return ret;
};
imports.wbg.__wbg_ctrlKey_6fb659a0acdb08d2 = function(arg0) {
    var ret = getObject(arg0).ctrlKey;
    return ret;
};
imports.wbg.__wbg_shiftKey_644bf95e5ac01f02 = function(arg0) {
    var ret = getObject(arg0).shiftKey;
    return ret;
};
imports.wbg.__wbg_type_e32f387f5584c765 = function(arg0, arg1) {
    var ret = getObject(arg1).type;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_target_e560052e31e4567c = function(arg0) {
    var ret = getObject(arg0).target;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_preventDefault_fa00541ff125b78c = function(arg0) {
    getObject(arg0).preventDefault();
};
imports.wbg.__wbg_instanceof_HtmlInputElement_8969541a2a0bded0 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLInputElement;
    return ret;
};
imports.wbg.__wbg_checked_5b6eab0ab31f5d34 = function(arg0) {
    var ret = getObject(arg0).checked;
    return ret;
};
imports.wbg.__wbg_type_f7dc0f33611f497c = function(arg0, arg1) {
    var ret = getObject(arg1).type;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_value_fc1c354d1a0e9714 = function(arg0, arg1) {
    var ret = getObject(arg1).value;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_instanceof_Element_c9423704dd5d9b1d = function(arg0) {
    var ret = getObject(arg0) instanceof Element;
    return ret;
};
imports.wbg.__wbg_getAttribute_25ddac571fec98e1 = function(arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    var ret = getObject(arg1).getAttribute(v0);
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_setAttribute_1776fcc9b98d464e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    getObject(arg0).setAttribute(v0, v1);
}, arguments) };
imports.wbg.__wbg_instanceof_HtmlElement_d3e8f1c1d6788b24 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLElement;
    return ret;
};
imports.wbg.__wbg_instanceof_HtmlSelectElement_e3dbe2a40aa03cfe = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLSelectElement;
    return ret;
};
imports.wbg.__wbg_value_d4cea9e999ffb147 = function(arg0, arg1) {
    var ret = getObject(arg1).value;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_instanceof_KeyboardEvent_39e350edcd4936d4 = function(arg0) {
    var ret = getObject(arg0) instanceof KeyboardEvent;
    return ret;
};
imports.wbg.__wbg_charCode_e15a2aba71bbaa8c = function(arg0) {
    var ret = getObject(arg0).charCode;
    return ret;
};
imports.wbg.__wbg_keyCode_8a05b1390fced3c8 = function(arg0) {
    var ret = getObject(arg0).keyCode;
    return ret;
};
imports.wbg.__wbg_altKey_773e7f8151c49bb1 = function(arg0) {
    var ret = getObject(arg0).altKey;
    return ret;
};
imports.wbg.__wbg_ctrlKey_8c7ff99be598479e = function(arg0) {
    var ret = getObject(arg0).ctrlKey;
    return ret;
};
imports.wbg.__wbg_shiftKey_894b631364d8db13 = function(arg0) {
    var ret = getObject(arg0).shiftKey;
    return ret;
};
imports.wbg.__wbg_metaKey_99a7d3732e1b7856 = function(arg0) {
    var ret = getObject(arg0).metaKey;
    return ret;
};
imports.wbg.__wbg_location_802154aca73cf67f = function(arg0) {
    var ret = getObject(arg0).location;
    return ret;
};
imports.wbg.__wbg_repeat_248c3b6d2b3e0a33 = function(arg0) {
    var ret = getObject(arg0).repeat;
    return ret;
};
imports.wbg.__wbg_key_7f10b1291a923361 = function(arg0, arg1) {
    var ret = getObject(arg1).key;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_get_a307c30b5f5df814 = function(arg0, arg1) {
    var ret = getObject(arg0)[arg1 >>> 0];
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_addEventListener_55682f77717d7665 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).addEventListener(v0, getObject(arg3), getObject(arg4));
}, arguments) };
imports.wbg.__wbg_removeEventListener_9cd36e5806463d5d = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).removeEventListener(v0, getObject(arg3), arg4 !== 0);
}, arguments) };
imports.wbg.__wbg_state_582d717f9eed0fc9 = function() { return handleError(function (arg0) {
    var ret = getObject(arg0).state;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_pushState_89ce908020e1d6aa = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    var v1 = getCachedStringFromWasm0(arg4, arg5);
    getObject(arg0).pushState(getObject(arg1), v0, v1);
}, arguments) };
imports.wbg.__wbg_instanceof_Node_235c78aca8f70c08 = function(arg0) {
    var ret = getObject(arg0) instanceof Node;
    return ret;
};
imports.wbg.__wbg_parentElement_96e1e07348340043 = function(arg0) {
    var ret = getObject(arg0).parentElement;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_childNodes_2cc9324ea7605e96 = function(arg0) {
    var ret = getObject(arg0).childNodes;
    return addHeapObject(ret);
};
imports.wbg.__wbg_textContent_dbe4d2d612abcd96 = function(arg0, arg1) {
    var ret = getObject(arg1).textContent;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbg_settextContent_07dfb193b5deabbc = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).textContent = v0;
};
imports.wbg.__wbg_instanceof_Text_2b91a768db957a84 = function(arg0) {
    var ret = getObject(arg0) instanceof Text;
    return ret;
};
imports.wbg.__wbg_pageX_41351f8d39f32f3b = function(arg0) {
    var ret = getObject(arg0).pageX;
    return ret;
};
imports.wbg.__wbg_pageY_c0e51cfead96c94d = function(arg0) {
    var ret = getObject(arg0).pageY;
    return ret;
};
imports.wbg.__wbg_which_a82f3f5ff4c2de7b = function(arg0) {
    var ret = getObject(arg0).which;
    return ret;
};
imports.wbg.__wbg_instanceof_IdleDeadline_4fad2202696b050a = function(arg0) {
    var ret = getObject(arg0) instanceof IdleDeadline;
    return ret;
};
imports.wbg.__wbg_timeRemaining_a95c5045575c3f7f = function(arg0) {
    var ret = getObject(arg0).timeRemaining();
    return ret;
};
imports.wbg.__wbg_pathname_d0014089875ea691 = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg1).pathname;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };
imports.wbg.__wbg_search_7e1c9ba7f3985c36 = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg1).search;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };
imports.wbg.__wbg_hash_2f90ddae1e6efe5f = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg1).hash;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
}, arguments) };
imports.wbg.__wbg_get_f45dff51f52d7222 = function(arg0, arg1) {
    var ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};
imports.wbg.__wbg_length_7b60f47bde714631 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};
imports.wbg.__wbg_newnoargs_f579424187aa1717 = function(arg0, arg1) {
    var v0 = getCachedStringFromWasm0(arg0, arg1);
    var ret = new Function(v0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_call_89558c3e96703ca1 = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_new_d3138911a89329b0 = function() {
    var ret = new Object();
    return addHeapObject(ret);
};
imports.wbg.__wbg_instanceof_ArrayBuffer_649f53c967aec9b3 = function(arg0) {
    var ret = getObject(arg0) instanceof ArrayBuffer;
    return ret;
};
imports.wbg.__wbg_instanceof_Error_4287ce7d75f0e3a2 = function(arg0) {
    var ret = getObject(arg0) instanceof Error;
    return ret;
};
imports.wbg.__wbg_new_55259b13834a484c = function(arg0, arg1) {
    var v0 = getCachedStringFromWasm0(arg0, arg1);
    var ret = new Error(v0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_message_1dfe93b595be8811 = function(arg0) {
    var ret = getObject(arg0).message;
    return addHeapObject(ret);
};
imports.wbg.__wbg_name_66305ab387468967 = function(arg0) {
    var ret = getObject(arg0).name;
    return addHeapObject(ret);
};
imports.wbg.__wbg_toString_3e854a6a919f2996 = function(arg0) {
    var ret = getObject(arg0).toString();
    return addHeapObject(ret);
};
imports.wbg.__wbg_isSafeInteger_91192d88df6f12b9 = function(arg0) {
    var ret = Number.isSafeInteger(getObject(arg0));
    return ret;
};
imports.wbg.__wbg_instanceof_Object_d6dae7f4da812832 = function(arg0) {
    var ret = getObject(arg0) instanceof Object;
    return ret;
};
imports.wbg.__wbg_entries_38f300d4350c7466 = function(arg0) {
    var ret = Object.entries(getObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbg_hasOwnProperty_5f7af26bc3dc1b0f = function(arg0, arg1) {
    var ret = getObject(arg0).hasOwnProperty(getObject(arg1));
    return ret;
};
imports.wbg.__wbg_resolve_4f8f547f26b30b27 = function(arg0) {
    var ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbg_then_a6860c82b90816ca = function(arg0, arg1) {
    var ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};
imports.wbg.__wbg_then_58a04e42527f52c6 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};
imports.wbg.__wbg_self_e23d74ae45fb17d1 = function() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_window_b4be7f48b24ac56e = function() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_globalThis_d61b1f48a57191ae = function() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_global_e7669da72fd7f239 = function() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_buffer_5e74a88a1424a2e0 = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};
imports.wbg.__wbg_new_e3b800e570795b3c = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbg_set_5b8081e9d002f0df = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};
imports.wbg.__wbg_length_30803400a8f15c59 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};
imports.wbg.__wbg_instanceof_Uint8Array_8a8537f46e056474 = function(arg0) {
    var ret = getObject(arg0) instanceof Uint8Array;
    return ret;
};
imports.wbg.__wbg_set_c42875065132a932 = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };
imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};
imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};
imports.wbg.__wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper514 = function(arg0, arg1, arg2) {
    var ret = makeClosure(arg0, arg1, 157, __wbg_adapter_36);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper516 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 157, __wbg_adapter_39);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper814 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 297, __wbg_adapter_42);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper864 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 326, __wbg_adapter_45);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1156 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_48);
    return addHeapObject(ret);
};

if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
    input = fetch(input);
}



const { instance, module } = await load(await input, imports);

wasm = instance.exports;
init.__wbindgen_wasm_module = module;
wasm.__wbindgen_start();
return wasm;
}

export default init;

