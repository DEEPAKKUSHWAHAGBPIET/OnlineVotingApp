const mongoose = require('mongoose')
require('dotenv').config()
const mongoURL = process.env.MongoDB_URL_LOCAL
//const mongoURL = process.env.MongoDB_URL



// mongoose.connect(mongoURL)


// const db = mongoose.connection;

// db.on('connected', ()=> {
//      console.log('connected to mongodb server')
// })

// db.on('error', (err)=> {
//      console.log('connection errorrr : ', err)
// })

// db.on('disconnected', ()=> {
//      console.log('Mongodb disconnected...')
// })

// module.exports = db;

const MongooseConnection = async () => {
     try {
       await mongoose.connect(mongoURL, {
         useNewUrlParser: true,
         useUnifiedTopology: true
       })
       console.log("db connected")
       
     }
     catch (error) {
       console.error(error);
     }
   }
   
MongooseConnection()
module.exports = MongooseConnection