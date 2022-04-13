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
        expected = expected[0]
        console.log(expected)
        const arg = getType(args)
        received.push(getType(arg))
        if ((expected.length > 1 && getType(args) !== getType(expected)) || (expected.length > 0 && !expected.some(type => {return  getType(type) === getType(args)}))) {
            //return throwError()
            console.log(false)
        } else console.log(true)
    }

    function throwError() {
        let expectedString = "";
        expected.forEach(item => {
            expectedString += Array.isArray(item) ? `[${item.join('|')}], ` : `${item}, `
        })
        expectedString = expectedString.slice(0, -2)
        throw new TypeError(`Expected ${expectedString}. Received ${received.join(', ')}.`);
    }

    function getType(obj) {
        return Object.prototype.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    }
}
module.exports = typeCheck

typeCheck([],[])        // true
typeCheck([],[[]])      // true
typeCheck([],["", []])  //true
typeCheck([],[""])      //false
typeCheck([],"")      //false