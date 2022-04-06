const http = require('http');
const path = require('path')

const Response = require('./services/response')
const Switcher = require('./services/switcher');

http.createServer((req, res) => {
    res = new Response(res)
    
    const host = 'http' + '://' + req.headers.host + '/';
    const url = () => {
        try {
            return new URL(req.url, host)
        } catch (error) {
            return error
        }
    };
    if (url().code) {
        return res.status(500).text()
    }
    const pathname = path.parse(path.join(__dirname, url().pathname))
    console.log(`${req.method}: ${pathname.base}`);

    if (pathname.ext) {
        console.log(path.join(__dirname, url().pathname))
        return res.file(path.join(__dirname, url().pathname))
    }

    const parts = url().pathname.split('/').filter(Boolean)

    res.setHeader('Access-Control-Allow-Origin', '*')

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
        res.status(405).text()
    }

}).listen(process.env.PORT || 8080, () => {
    console.log("Server running on port:", process.env.PORT || 8080)
});
