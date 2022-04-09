const typeCheck = require('./typeCheck')

class Response {
    #res
    #req
    #headers = {}
    #status = 200
    #message = ""
    #public = ""
    #mimeTypes = {
        "application/json": [".json"],
        "text/html": [".htm", ".html"],
        "text/css": [".css"],
        "text/plain": ".txt",
        "image/jpeg": [".jpeg", ".jpg"]
    } 
    #methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    constructor() {
        const mimeTypes = {}
        for (const key in this.#mimeTypes) {
            const elements = this.#mimeTypes[key];
            if (Array.isArray(elements)) {
                elements.forEach(element => {
                    mimeTypes[element] = key
                });
            } else {
                mimeTypes[elements] = key
            }
        }
        this.#mimeTypes = mimeTypes

        const methods = {}
        for (const method of this.#methods) {
            methods[method] = {
                "URIs": [],
                "default" : {}
            }
            this[method.toLowerCase()] = (uri, func, ...args) => {
                this.#addURI(method, uri, func, ...args)
            }
        }
        this.#methods = methods
    }
    public(folder) {
        typeCheck(arguments, "")
        this.#public = folder
    }
    default(method, func, ...args) {
        typeCheck(arguments, String(), Function)
        method = method.toUpperCase()
        this.#methods[method]["default"].function = func
        this.#methods[method]["default"].args = args
    }
    #addURI(method, uri, func, ...args) {
        typeCheck(arguments, String(), String(), Function)
        this.#methods[method]["URIs"][uri] = {
            "function": func,
            "args" : args
        }
    }
    run(method, uri) {
        try {
            uri = this.#methods[method]["URIs"][uri] || this.#methods[method]["default"]
            uri.function(this.#req, this, uri.args)
        } catch (error) {
            this.status(404).text("404")
        }
    }
    getMimeType(ext) {
        return this.#mimeTypes[ext] || "application/octet-stream"
    }
    setHeader(key, value) {
        this.#headers[key] = value
        return this
    }
    status(code) {
        this.#status = code
        return this
    }
    message(message) {
        this.#message = message
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
        this.configRes()
        this.#res.end(data || "")
    }
    configRes() {
        this.#res.statusCode = this.#status
        this.#res.statusMessage = this.#message
        for (const [key, value] of Object.entries(this.#headers)) {
            this.#res.setHeader(key, value)
        }
    }
    listen(port, callback) {
        const http = require('http');
        const path = require('path')
        const getURL = require('./getURL')
        http.createServer((req, res) => {
            this.#req = req
            this.#res = res
            
            //testing

            const url = getURL(req)

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
            req.parts = url.pathname.split(regexp).filter(Boolean)
            console.log(req.parts)
            return this.run(req.method, req.parts[1] || req.parts[0])

            //end test

            callback(req, this)
        }).listen(process.env.PORT || port, () => {
            console.log("Server running on port:", process.env.PORT || port)
        });
    }
}
module.exports = new Response()