function options(req, res) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Content-Type', 'application/json')
    res.status(200).end()
}

module.exports = options