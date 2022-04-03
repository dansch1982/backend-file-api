function addDeepData(object, element, key, bool) {
    if (typeof element === "object") {
        for (const deepKey in element) {
            const deepElement = element[deepKey]
            if (!object[key] || (typeof object[key] !== "object" && bool)) {
                object[key] = {}
            }
            addDeepData(object[key], deepElement, deepKey, bool)
        }
    }
    else if (bool === true || !object[key]) {
        object[key] = element;
    }
}
module.exports = addDeepData