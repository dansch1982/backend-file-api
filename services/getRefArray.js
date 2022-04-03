function getRefArray(object, parts) {
    const refArray = []
    for (let i = 0; i < parts.length; i++) {
        if (refArray.length <= 0) {
            refArray.push(object)
        } else {
            if (refArray[i-1]) {
                refArray.push(refArray[i-1][parts[i]])
            }
        }
    }
    return refArray;
}
module.exports = getRefArray