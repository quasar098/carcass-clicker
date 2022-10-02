const express = require('express')
const app = express()
require("dotenv").config()
const port = 8080

app.use(express.static('public'))

app.use('*', express.static('not-found'));

app.listen(process.env.PORT || port, () => {
    console.log(`listening`)
})
