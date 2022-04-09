const typeCheck = require('./typeCheck')

class Response {
    #res
    #req
    #headers = {}
    #status = 200
    #message = ""
    #static = ""
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
    static(folder) {
        typeCheck(arguments, "")
        this.#static = folder
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
            this.status(404).text("Page not found.")
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
            this.end(JSON.stringify(json || "empty"))
    }
    text(text) {
        this.#res.setHeader('Content-Type', this.getMimeType(".txt"))
        const type = Object.prototype.toString.call(text)
        if (text && type !== "object String") {
            text = type === Object.prototype.toString.call({}) ? JSON.stringify(text) : text.toString()
        }
        this.end(text || "empty")
    }
    html(html) {
        this.#res.setHeader('Content-Type', this.getMimeType(".html"))
            this.end(html || "empty")
    }
    file(file) {
        const fs = require('fs')
        fs.readFile(file.path, (error, data) => {
            if (error) {
                this.status(404).text("File not found.")
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
        typeCheck(arguments, Number(), [Function, undefined])
        const http = require('http');
        const path = require('path')
        const getURL = require('./getURL')
        http.createServer((req, res) => {
            this.#req = req
            this.#res = res
            
            req.url = getURL(req)
            
            if (req.url.code) {
                return res.status(500).text('Something went wrong.')
            }
            
            req.parts = req.url.pathname.split("/").filter(Boolean)
            
            console.log(req.method, req.parts.length > 0 ? req.parts : "/")

            if (callback) {
                callback(req, this)
            }

            const file = path.parse(path.join('.', this.#static || "", req.url.pathname))
            
            if (req.method === "GET" && file.ext) {
                file.path = path.join(file.dir, file.base)
                return this.file(file)
            }
            console.log(req)
            this.run(req.method, req.parts[0] || "/")

        }).listen(process.env.PORT || port, () => {
            console.log("Server running on port:", process.env.PORT || port)
        });
    }
}
module.exports = new Response()