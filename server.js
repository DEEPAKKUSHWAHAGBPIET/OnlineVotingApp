const express = require('express')
const app = express()
const db = require('./db')
require('dotenv').config()


const bodyParser = require('body-parser')
app.use(bodyParser.json())

const PORT = process.env.PORT || 4000;

//const {jwtAuthMiddleware} = require('./jwt')

//lets import person routes here in server
const userRoutes = require('./routes/userRoutes')
app.use('/user', userRoutes)

const candidateRoutes = require('./routes/candidateRoutes')
app.use('/candidate', candidateRoutes)

app.listen(PORT, ()=>{
     console.log("server is listing at port no : http://localhost:4000/")
})