const path = require('path')

function getFileName(parts) {
    const file = path.join(__dirname, "/../json", (parts[0] ? parts[0] : "") + ".json")
    return file;
}
module.exports = getFileName