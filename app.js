const router = require("./routes/routes.js")
const express = require('express')
const cors = require("cors")
const app = express()

var corsOptions = {
    origin: "*"
}

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))
app.use(express.json())
app.use('/api', router)

module.exports = app


