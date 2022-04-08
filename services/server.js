class Response {
    #res
    #req
    #public = ""
    #status = 200
    #message = ""
    #mimeTypes = {
        "application/json": [".json"],
        "text/html": [".htm", ".html"],
        "text/css": [".css"],
        "text/plain": ".txt",
        "image/jpeg": [".jpeg", ".jpg"]
    }
    #methods = {
        "GET" : [],
        "POST" : []
    }
    constructor() {
        const object = {}
        for (const key in this.#mimeTypes) {
            const elements = this.#mimeTypes[key];
            if (Array.isArray(elements)) {
                elements.forEach(element => {
                    object[element] = key
                });
            } else {
                object[elements] = key
            }
        }
        this.#mimeTypes = object
    }
    get(objective, func, ...args) {
        this.#addObjective("GET", objective, func, ...args)
    }
    post(objective, func, ...args) {
        this.#addObjective("POST", objective, func, ...args)
    }
    #addObjective(method, objective, func, ...args) {
        this.#methods[method][objective] = {
            "function": func,
            "args" : args
        }
    }
    run(method, objective) {
        try {
            objective = this.#methods[method][objective]
            objective.function(this.#req, this, objective.args)
        } catch (error) {
            console.log(error)
            this.status(404).text("Something went wrong.")
        }
    }
    getMimeType(ext) {
        return this.#mimeTypes[ext] || "application/octet-stream"
    }
    setHeader(key, value) {
        this.#res.setHeader(key, value)
        return this
    }
    status(code) {
        this.#res.statusCode = code || this.#status
        return this
    }
    message(message) {
        this.#res.statusMessage = message || this.#message
        return this
    }
    json(json) {
        this.#res.setHeader('Content-Type', this.getMimeType(".json"))
            this.end(JSON.stringify(json || ""))
    }
    text(text) {
        this.#res.setHeader('Content-Type', this.getMimeType(".txt"))
            this.end(text || "")
    }
    html(html) {
        this.#res.setHeader('Content-Type', this.getMimeType(".html"))
            this.end(html || "")
    }
    file(file) {
        const fs = require('fs')
        fs.readFile(file.path, (error, data) => {
            if (error) {
                this.status(404).text(error.toString())
            } else {
                this.#res.setHeader('Content-Type', this.getMimeType(file.ext))
                this.status(200).end(data)
            }
        })
    }
    end(data) {
        this.#res.end(data || "")
    }
    listen(port, callback) {
        const http = require('http');
        const path = require('path')
        const getURL = require('./getURL')
        http.createServer((req, res) => {
            this.#req = req
            this.#res = res
            
            //testing

            /* const url = getURL(req)

            if (url.code) {
                return res.status(500).text('Something went wrong.')
            }

            const file = path.parse(path.join('.', this.#public || "", url.pathname))
            file.path = path.join(file.dir, file.base)

            if (req.method === "GET" && file.ext) {
                return this.file(file)
            }

            const exp = `(${"/"})`
            const regexp = new RegExp(exp, "g")
            const parts = url.pathname.split(regexp).filter(Boolean)
            console.log(parts)
            return this.run(req.method, parts[1] || parts[0]) */

            //end test

            callback(req, this)
        }).listen(process.env.PORT || port, () => {
            console.log("Server running on port:", process.env.PORT || port)
        });
    }
}
module.exports = new Response()