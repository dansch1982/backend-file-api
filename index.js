const server = require('./services/server')

server.listen(8080)

server.setHeader('Access-Control-Allow-Origin', '*')

server.static("public")

const get = require('./controllers/get')
server.default('get', get)

const post = require('./controllers/post')
server.default('post', post)

server.default('put', post, true)

const deletePost = require('./controllers/deletePost')
server.default('delete', deletePost)

const options = require('./controllers/options')
server.default('options', options)