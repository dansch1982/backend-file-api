function typeCheck(args, ...expected) {
    const received = []
    if(!expected.every((arg, index) => {
        const [,value] = Object.entries(args)[index]
        expected[index] = Object.prototype.toString.call(arg)
        received[index] = Object.prototype.toString.call(value)
        return received[index] === expected[index]
    })) {
        throw new TypeError(`Expected ${expected}, received ${received}.`);
    }
}
module.exports = typeCheck