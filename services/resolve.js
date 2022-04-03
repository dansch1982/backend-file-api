
function resolve(res, data, type) {
    res.writeHead(200, {
        "Content-Type": type,
        "Access-Control-Allow-Origin": "*"
    })
    try {
        JSON.parse(data)
    } catch (error) {
        data = JSON.stringify(data)
    }
    if (typeof data !== "string") {
        data = new String(data).toString()
    }
    res.end(data);
}

module.exports = resolve