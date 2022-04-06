function options(res) {
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, DELETE, OPTIONS')
    res.setHeader('Content-Type', 'application/json')
    res.status(200).end()
}

module.exports = options