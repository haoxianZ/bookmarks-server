require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {NODE_ENV} = require('./config')
const validation = require('./validation')
const bookmarksRouter = require('./bookmarksRouter')
const errorHandle = require('./erorrHandle')

const app = express()

app.use(morgan((NODE_ENV === 'production'?
'tiny':'common',{
  skip:()=>NODE_ENV === 'development'
})))

app.use(cors())
app.use(helmet())
app.use(validation)
app.use(bookmarksRouter)
app.get('/',(req,res)=>{
  res.send('Hi, this is the mainpage')
})
app.use(errorHandle)
module.exports = app