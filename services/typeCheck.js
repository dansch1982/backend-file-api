function typeCheck(args, ...expected) {
    const received = []
    if(!args || !expected.every((arg, index) => {
        const value = Object.values(args)[index]
        expected[index] = Object.prototype.toString.call(arg)
        received[index] = Object.prototype.toString.call(value)
        return received[index] === expected[index]
    })) {
        throw new TypeError(`Expected ${expected}, received ${received}.`);
    } else {
        return true
    }
}
module.exports = typeCheck