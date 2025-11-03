"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReport = writeReport;
const resolveDescriptors_1 = require("../types/resolveDescriptors");
const Writer_1 = require("../utils/Writer");
function writeReport(ctx, pkg) {
    const w = new Writer_1.Writer();
    const abi = JSON.parse(pkg.abi);
    w.write(`
        # Tact compilation report
        Contract: ${pkg.name}
        BoC Size: ${Buffer.from(pkg.code, "base64").length} bytes
    `);
    w.append();
    // Structures
    w.write(`## Structures (Structs and Messages)`);
    w.write("Total structures: " + abi.types.length);
    w.append();
    for (const t of abi.types) {
        const tt = (0, resolveDescriptors_1.getType)(ctx, t.name.endsWith("$Data") ? t.name.slice(0, -5) : t.name);
        w.write(`### ${t.name}`);
        w.write(`TL-B: \`${tt.tlb}\``);
        w.write(`Signature: \`${tt.signature}\``);
        w.append();
    }
    // Get methods
    w.write(`## Get methods`);
    w.write("Total get methods: " + abi.getters.length);
    w.append();
    for (const t of abi.getters) {
        w.write(`## ${t.name}`);
        if (t.arguments.length === 0) {
            w.write(`No arguments`);
        }
        else {
            for (const arg of t.arguments) {
                w.write(`Argument: ${arg.name}`);
            }
        }
        w.append();
    }
    // Exit codes
    w.write(`## Exit codes`);
    Object.entries(abi.errors).forEach(([t, abiError]) => {
        w.write(`* ${t}: ${abiError.message}`);
    });
    w.append();
    const t = (0, resolveDescriptors_1.getType)(ctx, pkg.name);
    const writtenEdges = new Set();
    // Trait inheritance diagram
    w.write(`## Trait inheritance diagram`);
    w.append();
    w.write("```mermaid");
    w.write("graph TD");
    function writeTraits(t) {
        for (const trait of t.traits) {
            const edge = `${t.name} --> ${trait.name}`;
            if (writtenEdges.has(edge)) {
                continue;
            }
            writtenEdges.add(edge);
            w.write(edge);
            writeTraits(trait);
        }
    }
    w.write(t.name);
    writeTraits(t);
    w.write("```");
    w.append();
    writtenEdges.clear();
    // Contract dependency diagram
    w.write(`## Contract dependency diagram`);
    w.append();
    w.write("```mermaid");
    w.write("graph TD");
    function writeDependencies(t) {
        for (const dep of t.dependsOn) {
            const edge = `${t.name} --> ${dep.name}`;
            if (writtenEdges.has(edge)) {
                continue;
            }
            writtenEdges.add(edge);
            w.write(edge);
            writeDependencies(dep);
        }
    }
    writtenEdges.clear();
    w.write(t.name);
    writeDependencies(t);
    w.write("```");
    return w.end();
}
