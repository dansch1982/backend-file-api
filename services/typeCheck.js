function typeCheck(args, ...expected) {
    const received = []
    if (getType(args) === "arguments") {
        if (!args || !expected.every((arg, index) => {

                const value = Object.values(args)[index]
                received[index] = getType(value)

                if (Array.isArray(arg) && arg.length > 0) {
                    arg.forEach((item, index) => {
                        arg[index] = getType(item)
                    })
                    if (arg.indexOf(received[index]) >= 0) {
                        expected[index] = received[index]
                    }
                } else {
                    expected[index] = getType(arg)
                }

                return received[index] === expected[index]
            })) {
                throwError()
        } else {
            return true
        }
    } else {
        //console.log(getType(args))
        [expected] = expected
        console.log(expected.length)
    }

    function throwError() {
        let expectedString = "";
        expected.forEach(item => {
            expectedString += Array.isArray(item) ? `[${item.join('|')}], ` : `${item}, `
        })
        expectedString = expectedString.slice(0, -2)
        throw new TypeError(`Expected ${expectedString}. Received ${received.join(', ')}.`);
    }

    function getType(item) {
        return Object.prototype.toString.call(item).replace(/^\[object |\]$/g, '').toLowerCase()
    }
}
module.exports = typeCheck

typeCheck([],[""])