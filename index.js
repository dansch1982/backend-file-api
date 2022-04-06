const http = require('http');

const Response = require('./services/Response')
const Switcher = require('./services/Switcher');

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
    console.log(`${req.method}: ${url().pathname}`);
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
