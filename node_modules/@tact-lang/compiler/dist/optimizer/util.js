"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.divFloor = divFloor;
exports.abs = abs;
exports.sign = sign;
exports.modFloor = modFloor;
// precondition: the divisor is not zero
// rounds the division result towards negative infinity
function divFloor(a, b) {
    const almostSameSign = a > 0n === b > 0n;
    if (almostSameSign) {
        return a / b;
    }
    return a / b + (a % b === 0n ? 0n : -1n);
}
function abs(a) {
    return a < 0n ? -a : a;
}
function sign(a) {
    if (a === 0n)
        return 0n;
    else
        return a < 0n ? -1n : 1n;
}
// precondition: the divisor is not zero
// rounds the result towards negative infinity
// Uses the fact that a / b * b + a % b == a, for all b != 0.
function modFloor(a, b) {
    return a - divFloor(a, b) * b;
}
