function options(res) {
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, PUT, GET, DELETE, OPTIONS",
        "Content-Type" : "application/json"
    })
    res.end()
}

module.exports = options