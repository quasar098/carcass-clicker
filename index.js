const express = require('express')
const app = express()
const port = 8080

app.use(express.static('public'))

app.use('*', express.static('not-found'));

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
