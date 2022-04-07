const http = require('http');
const path = require('path')

const Response = require('./services/response')
const Switcher = require('./services/switcher');
const getURL = require('./services/getURL')

http.createServer((req, res) => {

    res = new Response(res)
    res.setHeader('Access-Control-Allow-Origin', '*')

    const url = getURL(req)

    if (url.code) {
        return res.status(500).text('Something went wrong.')
    }

    const file = path.parse(path.join(__dirname, url.pathname))
    file.path = path.join(file.dir, file.base)
    
    console.log(`${req.method}: ${url.pathname}`);

    if (file.ext) {
        return res.file(file)
    }

    const parts = url.pathname.split('/').filter(Boolean)

    Switcher.addObjective("OPTIONS", () => {
        const options = require('./controllers/options')
        options(res)
    })

    Switcher.addObjective("GET", () => {
        const get = require('./controllers/get')
        get(res, parts);
    })
    
    Switcher.addObjective("PUT", () => {
        Switcher.switch('POST', true)
    })
    
    Switcher.addObjective("POST", (...args) => {
        const [put] = args
        const post = require('./controllers/post')
        post(req, res, parts, put);
    })

    Switcher.addObjective("DELETE", () => {
        const deletePost = require('./controllers/deletePost')
        deletePost(res, parts)
    })

    if(!Switcher.switch(req.method)) {
        res.status(405).text("Something went wrong.")
    }

}).listen(process.env.PORT || 8080, () => {
    console.log("Server running on port:", process.env.PORT || 8080)
});
