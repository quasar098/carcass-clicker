const express = require('express')
const http = require('http');
const app = express()
const server = http.createServer(app);
const port = process.env.PORT || 8080

app.use(express.static('public'))

app.use('*', express.static('not-found'));

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})
