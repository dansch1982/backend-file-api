const http = require('http');

const resolve = require('./services/resolve')

http.createServer((req, res) => {
    const host = 'http' + '://' + req.headers.host + '/';
    const url = new URL(req.url, host);
    console.log(`${req.method}: ${url.pathname}`);
    const parts = url.pathname.split('/').filter(Boolean)
    
    const switcher = require('./services/switcher');

    switcher.addObjective("OPTIONS", () => {
        const options = require('./controllers/options')
        options(res)
    })

    switcher.addObjective("GET", () => {
        const get = require('./controllers/get')
        get(res, parts);
    })
    
    switcher.addObjective("PUT", () => {
        switcher.switch('POST', true)
    })
    
    switcher.addObjective("POST", (...args) => {
        const [put] = args
        const postAndPut = require('./controllers/postAndPut')
        postAndPut(req, res, parts, put);
    })

    switcher.addObjective("DELETE", () => {
        const deletePost = require('./controllers/deletePost')
        deletePost(res, parts)
    })

    if(!switcher.switch(req.method)) {
        resolve(res, error("Something went wrong."), "application/json")
    }

}).listen(process.env.PORT || 8080);