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
        this.configRes()
        this.res.end(JSON.stringify(json || {"error":"Something went wrong."}))
    }
    text(text) {
        this.setHeader('Content-Type', 'text/plain')
        this.configRes()
        this.res.end(text || 'Something went wrong.')
    }
    end() {
        this.configRes()
        this.res.end()
    }
    configRes() {
        this.#headers.forEach(head => {
            const [key, value] = [...head]
            this.res.setHeader(key, value)
        })
    }
}

module.exports = Response