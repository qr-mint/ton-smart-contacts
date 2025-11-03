"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxTupleSize = void 0;
exports.writeStruct = writeStruct;
exports.writeParser = writeParser;
exports.writeSerializer = writeSerializer;
exports.writeInitSerializer = writeInitSerializer;
exports.writeTupleParser = writeTupleParser;
exports.writeGetterTupleParser = writeGetterTupleParser;
exports.writeGetParser = writeGetParser;
exports.writeTupleSerializer = writeTupleSerializer;
exports.writeArgumentToStack = writeArgumentToStack;
exports.writeDictParser = writeDictParser;
const serializers_1 = require("./serializers");
const errors_1 = require("../../error/errors");
exports.maxTupleSize = 15;
function throwUnsupportedType(type) {
    (0, errors_1.throwInternalCompilerError)(`Unsupported type: ${JSON.stringify(type)}`);
}
function writeStruct(name, fields, exp, w) {
    w.append(`${exp ? "export " : " "}type ${name} = {`);
    w.inIndent(() => {
        w.append(`$$type: '${name}';`);
        outer: for (const f of fields) {
            for (const s of serializers_1.serializers) {
                const v = s.abiMatcher(f.type);
                if (v) {
                    w.append(`${f.name}: ${s.tsType(v)};`);
                    continue outer;
                }
            }
            throwUnsupportedType(f.type);
        }
    });
    w.append(`}`);
    w.append();
}
function writeParser(s, allocation, w) {
    w.append(`export function load${s.name}(slice: Slice) {`);
    w.inIndent(() => {
        w.append(`const sc_0 = slice;`);
        if (s.header) {
            w.append(`if (sc_0.loadUint(32) !== ${s.header}) { throw Error('Invalid prefix'); }`);
        }
        writeParserCell(0, allocation, s, w);
        w.append(`return { ${[`$$type: '${s.name}' as const`, ...s.fields.map((v) => v.name + ": _" + v.name)].join(", ")} };`);
    });
    w.append(`}`);
    w.append();
}
function writeParserCell(gen, src, s, w) {
    for (const f of src.ops) {
        writeParserField(gen, f, s, w);
    }
    if (src.next) {
        w.append(`const sc_${gen + 1} = sc_${gen}.loadRef().beginParse();`);
        writeParserCell(gen + 1, src.next, s, w);
    }
}
function writeParserField(gen, field, s, w) {
    const name = "_" + field.name;
    const type = field.type;
    for (const s of serializers_1.serializers) {
        const v = s.abiMatcher(type);
        if (v) {
            s.tsLoad(v, `sc_${gen}`, name, w);
            return;
        }
    }
    throwUnsupportedType(type);
}
function writeSerializer(s, allocation, w) {
    w.append(`export function store${s.name}(src: ${s.name}) {`);
    w.inIndent(() => {
        w.append(`return (builder: Builder) => {`);
        w.inIndent(() => {
            w.append(`const b_0 = builder;`);
            if (s.header) {
                w.append(`b_0.storeUint(${s.header}, 32);`);
            }
            writeSerializerCell(0, allocation, w);
        });
        w.append(`};`);
    });
    w.append(`}`);
    w.append();
}
function writeInitSerializer(name, allocation, w) {
    w.append(`function init${name}(src: ${name}) {`);
    w.inIndent(() => {
        w.append(`return (builder: Builder) => {`);
        w.inIndent(() => {
            w.append(`const b_0 = builder;`);
            writeSerializerCell(0, allocation, w);
        });
        w.append(`};`);
    });
    w.append(`}`);
    w.append();
}
function writeSerializerCell(gen, src, w) {
    for (const f of src.ops) {
        writeSerializerField(gen, f, w);
    }
    if (src.next) {
        w.append(`const b_${gen + 1} = new Builder();`);
        writeSerializerCell(gen + 1, src.next, w);
        w.append(`b_${gen}.storeRef(b_${gen + 1}.endCell());`);
    }
}
function writeSerializerField(gen, s, w) {
    const name = "src." + s.name;
    const type = s.type;
    for (const s of serializers_1.serializers) {
        const v = s.abiMatcher(type);
        if (v) {
            s.tsStore(v, `b_${gen}`, name, w);
            return;
        }
    }
    throwUnsupportedType(type);
}
function writeTupleParser(s, w) {
    w.append(`function loadTuple${s.name}(source: TupleReader) {`);
    w.inIndent(() => {
        if (s.fields.length <= exports.maxTupleSize) {
            for (const f of s.fields) {
                writeTupleFieldParser("_" + f.name, f.type, w);
            }
        }
        else {
            const fields = [...s.fields];
            while (fields.length >= exports.maxTupleSize) {
                const batch = fields.splice(0, exports.maxTupleSize - 1);
                for (const f of batch) {
                    writeTupleFieldParser("_" + f.name, f.type, w);
                }
                w.append(`source = source.readTuple();`);
            }
            for (const f of fields) {
                writeTupleFieldParser("_" + f.name, f.type, w);
            }
        }
        w.append(`return { ${[`$$type: '${s.name}' as const`, ...s.fields.map((v) => v.name + ": _" + v.name)].join(", ")} };`);
    });
    w.append(`}`);
    w.append();
}
function writeGetterTupleParser(s, w) {
    w.append(`function loadGetterTuple${s.name}(source: TupleReader) {`);
    w.inIndent(() => {
        for (const f of s.fields) {
            writeTupleFieldParser("_" + f.name, f.type, w, true);
        }
        w.append(`return { ${[`$$type: '${s.name}' as const`, ...s.fields.map((v) => v.name + ": _" + v.name)].join(", ")} };`);
    });
    w.append(`}`);
    w.append();
}
function writeGetParser(name, type, w) {
    writeTupleFieldParser(name, type, w, true);
}
function writeTupleFieldParser(name, type, w, fromGet = false) {
    for (const s of serializers_1.serializers) {
        const v = s.abiMatcher(type);
        if (v) {
            s.tsLoadTuple(v, `source`, name, w, fromGet);
            return;
        }
    }
    throwUnsupportedType(type);
}
function writeTupleSerializer(s, w) {
    w.append(`function storeTuple${s.name}(source: ${s.name}) {`);
    w.inIndent(() => {
        w.append(`const builder = new TupleBuilder();`);
        for (const f of s.fields) {
            writeVariableToStack(`source.${f.name}`, f.type, w);
        }
        w.append(`return builder.build();`);
    });
    w.append(`}`);
    w.append();
}
function writeArgumentToStack(name, ref, w) {
    writeVariableToStack(name, ref, w);
}
function writeVariableToStack(name, type, w) {
    for (const s of serializers_1.serializers) {
        const v = s.abiMatcher(type);
        if (v) {
            s.tsStoreTuple(v, `builder`, name, w);
            return;
        }
    }
    throwUnsupportedType(type);
}
function writeDictParser(s, w) {
    w.write(`
        function dictValueParser${s.name}(): DictionaryValue<${s.name}> {
            return {
                serialize: (src, builder) => {
                    builder.storeRef(beginCell().store(store${s.name}(src)).endCell());
                },
                parse: (src) => {
                    return load${s.name}(src.loadRef().beginParse());
                }
            }
        }
    `);
    w.append();
}
