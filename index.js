const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

http.createServer((req, res) => {
    console.log(req.url)
    if (!path.extname(req.url)) {
        const parts = req.url.split('/').filter(Boolean)
        const part = parts.length <= 0 ? "index" : parts[parts.length - 1]
        const con = createConnection('localhost', 'root', "mycms")
        const query = `SELECT * FROM content WHERE LOWER(REPLACE(content.PageName, " ","") ) = "${part.toLowerCase()}"`

        con.query(query, (err, results, fields) => {
            let html;
            if (results.length > 0) {
                const page = results[0]
                html = createPage(page)
            }
            res.writeHead(200, {
                "Content-Type": "text/html"
            })
            res.end(html)
        })
    } else if (['.jpg','.png'].includes(path.extname(req.url))) {
        const file = path.join(__dirname, req.url)
        const fileStream = fs.createReadStream(file);
        res.writeHead(200, {
            "Content-Type": "image/png"
        });
        fileStream.pipe(res);
    } else if (['.css'].includes(path.extname(req.url))) {
        const file = path.join(__dirname, req.url)
        const fileStream = fs.createReadStream(file);
        res.writeHead(200, {
            "Content-Type": "text/css"
        });
        fileStream.pipe(res);
    } else {
        res.writeHead(200, {
            "Content-Type": "text/html"
        })
        res.end()
    }
}).listen(8080);

function createConnection(host, user, db) {
    const connection = mysql.createConnection({
        host: host,
        user: user,
        database: db
    });
    return connection;
}

function createPage(page) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>${page.PageName}</title>
    </head>
    <body>
    <section>
    <h1>${page.Header}</h1>
    <p>${page.Text}</p>
    </section>
    <section>
    <h2>${page.ImageText}</h2>
    <img src="${page.Image}" alt="${page.Image.split('.')[0]}">
    </section>
    <section>
    <a href="${page.Link}">${page.LinkText}</a>
    </section>
    </body>
    </html>
    `
    return html
}