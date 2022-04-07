class Response {
    #res
    #status = 200
    #message = ""
    #MIME = {
        ".json" : "application/json",
        ".html" : "text/html",
        ".css" : "text/css",
        ".txt" : "text/plain",
    }
    constructor() {
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
        this.#res.setHeader('Content-Type', this.#MIME[".json"])
            this.end(JSON.stringify(json || ""))
    }
    text(text) {
        this.#res.setHeader('Content-Type', this.#MIME[".txt"])
            this.end(text || "")
    }
    html(html) {
        this.#res.setHeader('Content-Type', this.#MIME[".html"])
            this.end(html || "")
    }
    file(file) {
        const fs = require('fs')
        fs.readFile(file.path, (error, data) => {
            if (error) {
                this.status(404).text(error.toString())
            } else {
                if (this.#MIME[file.ext]) {
                    this.#res.setHeader('Content-Type', this.#MIME[file.ext])
                }
                this.status(200).end(data)
            }
        })
    }
    end(data) {
        this.#res.end(data || "")
    }
    listen(port, callback) {
        const http = require('http');
        http.createServer((req, res) => {
            this.#res = res
            callback(req, this)
        }).listen(process.env.PORT || port, () => {
            console.log("Server running on port:", process.env.PORT || port)
        });
    }
}
module.exports = new Response()