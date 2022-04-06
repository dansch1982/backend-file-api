const fs = require('fs')

class Response {
    #headers = []
    #status = 200
    #message = ""
    constructor(res) {
        this.res = res
    }
    setHeader(key, value) {
        this.#headers.push([key, value])
    }
    status(code) {
        this.res.statusCode = code || this.#status
        return this
    }
    message(message) {
        this.res.statusMessage = message || this.#message
        return this
    }
    json(json) {
        this.setHeader('Content-Type', 'application/json')
        this.end(JSON.stringify(json || {"error":"Something went wrong."}))
    }
    text(text) {
        this.setHeader('Content-Type', 'text/plain')
        this.end(text || 'Something went wrong.')
    }
    html(html) {
        this.setHeader('Content-Type', 'text/html')
        this.end(html || 'Something went wrong.')
    }
    file(file) {
        fs.readFile(file, (error, data) => {
            if (error) {
                this.status(500).text(error.toString())
            } else {
                this.status(200).end(data)
            }
        })
    }
    end(data) {
        this.configRes()
        this.res.end(data)
    }
    configRes() {
        this.#headers.forEach(head => {
            const [key, value] = [...head]
            this.res.setHeader(key, value)
        })
    }
}

module.exports = Response