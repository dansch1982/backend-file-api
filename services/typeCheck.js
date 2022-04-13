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
        expected.forEach((element, index) => {
            if (Array.isArray(element) && element.length > 0) {
                expected[index] = element
                console.log(expected[index])
            } else {
                expected = getType(element)
            }
        });
        const arg = getType(args)
        received.push(getType(arg))
        console.log("received", arg,"-", "expected", expected)
    }

    function throwError() {
        console.log(expected)
        let expectedString = "";
        expected.forEach(item => {
            //console.log(`item: ${item}`)
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

typeCheck([],[])        // false
typeCheck([],[[]])      // false
typeCheck([],["", []])  //false
typeCheck([],[""])      //true
typeCheck([],"")      //true