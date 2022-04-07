function getURL(req) {
    const host = 'http' + '://' + req.headers.host + '/';
    try {
        return new URL(req.url, host)
    } catch (error) {
        return error
    }
};

module.exports = getURL