"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syntaxErrorSchema = void 0;
const attributeSchema = (name) => ({ text, sub }, handle) => ({
    duplicate: (attr) => {
        return handle(sub `Duplicate ${text(name)} attribute "${text(attr)}"`);
    },
    notAbstract: () => {
        return handle(sub `Abstract ${text(name)} doesn't have abstract modifier`);
    },
    tooAbstract: () => {
        return handle(sub `Non-abstract ${text(name)} has abstract modifier`);
    },
});
const getExpectedText = (expected) => {
    const result = [];
    const failures = [...expected].sort();
    for (const [idx, failure] of failures.entries()) {
        if (idx > 0) {
            if (idx === failures.length - 1) {
                result.push(failures.length > 2 ? ", or " : " or ");
            }
            else {
                result.push(", ");
            }
        }
        result.push(failure);
    }
    return result.join("");
};
const syntaxErrorSchema = (display, handle) => {
    const { sub, text } = display;
    return {
        constant: attributeSchema("constant")(display, handle),
        function: attributeSchema("function")(display, handle),
        topLevelConstantWithAttribute: () => {
            return handle(sub `Module-level constants do not support attributes`);
        },
        literalTooLong: () => {
            return handle(sub `Bitstring has more than 128 digits`);
        },
        extraneousComma: () => {
            return handle(sub `Empty parameter list should not have a dangling comma`);
        },
        duplicateField: (name) => {
            return handle(text(`Duplicate field destructuring: "${name}"`));
        },
        restShouldBeLast: () => {
            return handle(text(`Rest parameter should be last`));
        },
        importWithBackslash: () => {
            return handle(sub `Import path can't contain "\\"`);
        },
        reservedVarPrefix: (prefix) => {
            return handle(text(`Variable name cannot start with "${prefix}"`));
        },
        notCallable: () => {
            return handle(sub `Expression is not callable`);
        },
        noBouncedWithoutArg: () => {
            return handle(sub `bounced() receiver should accept a Message, bounced<Message> or Slice`);
        },
        noBouncedWithString: () => {
            return handle(sub `bounced() receiver can only accept a Message, bounced<Message> or Slice`);
        },
        noConstantDecl: () => {
            return handle(sub `Constant definition requires an initializer`);
        },
        noFunctionDecl: () => {
            return handle(sub `Only full function definitions are allowed here`);
        },
        expected: (expects) => {
            return handle(text(`Expected ${getExpectedText(expects)}`));
        },
        invalidFuncId: () => {
            return handle(sub `Invalid FunC identifier`);
        },
        reservedFuncId: () => {
            return handle(sub `Reserved FunC identifier`);
        },
        numericFuncId: () => {
            return handle(sub `FunC identifier cannot be a number`);
        },
        leadingZeroUnderscore: () => {
            return handle(sub `Numbers with leading zeroes cannot use underscores for JS compatibility`);
        },
        noFolderImports: () => {
            return handle(sub `Cannot import a folder`);
        },
        invalidImport: () => {
            return handle(sub `Import must start with ./, ../ or @stdlib/`);
        },
        escapingImport: () => {
            return handle(sub `Standard library imports should be inside its root`);
        },
        asNotAllowed: () => {
            return handle(sub `"as" type is not allowed here`);
        },
        multipleOptionals: () => {
            return handle(sub `Nested optional types are not allowed`);
        },
        onlyOptionalOfNamed: () => {
            return handle(sub `Only named type can be optional`);
        },
        genericArgCount: (name, expectedCount, gotCount) => {
            return handle(sub `${text(name)}<> expects exactly ${text(String(expectedCount))} arguments, but got ${text(String(gotCount))}`);
        },
        unknownType: (name) => {
            return handle(sub `Unknown generic type: ${text(name)}`);
        },
        onlyBouncedOfNamed: () => {
            return handle(sub `Only named type can be bounced<>`);
        },
        mapOnlyOneAs: (name) => {
            return handle(sub `Cannot use several "as" on ${text(name)} of a map`);
        },
        cannotBeOptional: (name) => {
            return handle(sub `${text(name)} cannot be optional`);
        },
        onlyTypeId: (name) => {
            return handle(sub `${text(name)} can only be a named type`);
        },
        fieldOnlyOneAs: () => {
            return handle(sub `Cannot use several "as" on a field type`);
        },
        noOptionalFieldType: () => {
            return handle(sub `Field type cannot be optional`);
        },
        fieldMustBeNamed: () => {
            return handle(sub `Only named type can be a type of a field`);
        },
        unknownGeneric: () => {
            return handle(sub `Unknown generic type`);
        },
    };
};
exports.syntaxErrorSchema = syntaxErrorSchema;
