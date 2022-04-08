const path = require('path')

const server = require('./services/server')
const switcher = require('./services/switcher');
const getURL = require('./services/getURL')

server.listen(8080, (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*')

    const url = getURL(req)

    if (url.code) {
        return res.status(500).text('Something went wrong.')
    }

    const file = path.parse(path.join(__dirname, url.pathname))
    file.path = path.join(file.dir, file.base)
    console.log(`${req.method}: ${url.pathname}`);

    if (req.method === "GET" && file.ext) {
        return res.file(file)
    }

    const parts = url.pathname.split('/').filter(Boolean)

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
        const post = require('./controllers/post')
        post(req, res, parts, put);
    })

    switcher.addObjective("DELETE", () => {
        const deletePost = require('./controllers/deletePost')
        deletePost(res, parts)
    })
    if (!switcher.switch(req.method)) {
        res.status(405).text("Something went wrong.")
    }
})

//TESTING

function testGet(req, res, args) {
    console.log("GET")
    res.status(200).text("GETTING: " + args.join(", "))
}
server.get("test", testGet, "fruit", "apple")

function testPost(req, res, args) {
    console.log("POST")
    res.status(200).text("POSTING: " + args.join(", "))
}
server.post("test", testPost, "fruit", "apple")

server.get('/', (req, res) => {
    res.status(200).text("ok")
})