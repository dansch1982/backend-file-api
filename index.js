const Server = require('./services/server')

const server = new Server({
    "methods": "GET, POST, PUT, DELETE, OPTIONS",
    "headers" : {
        'Access-Control-Allow-Origin': '*'
    }
})

server.listen(8080)

server.static("public")

const get = require('./controllers/get')
server.default('get', get)

const post = require('./controllers/post')
server.default('post', post)

server.default('put', post, true)

const deletePost = require('./controllers/deletePost')
server.default('delete', deletePost)

server.default('options', (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Content-Type', 'application/json')
    res.status(200).end()
})