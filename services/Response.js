class Response {
    #headers = [['Access-Control-Allow-Origin', '*']]
    #status = 200
    #message = ""
    constructor(res) {
        this.res = res
    }
    addHeader(key, value) {
        this.#headers.push([key, value])
    }
    status(code) {
        this.#status = code
        return this
    }
    message(string) {
        this.#message = string
        return this
    }
    json(data) {
        this.addHeader('Content-Type', 'application/json')
        this.configRes()
        this.res.end(JSON.stringify(data))
    }
    configRes() {
        this.res.statusCode =  this.#status
        this.res.statusMessage = this.#message
        this.#headers.forEach(head => {
            const [key, value] = [...head]
            this.res.setHeader(key, value)
        })
    }
}

module.exports = Response