require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {NODE_ENV} = require('./config')
const validation = require('./validation')
const bookmarksRouter = require('./bookmarksRouter')
const errorHandle = require('./erorrHandle')
const BookmarksService = require('./bookmarks-service')
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
app.get('/bookmarks', (req,res,next)=>{
  const knexInstance = req.app.get('db')
  BookmarksService.getAll(knexInstance)
  .then(bookmarks=>{res.json(bookmarks)}).catch(next)
})
app.get('/bookmarks/:bookmarkId',(req,res,next)=>{
  const knexInstance = req.app.get('db')
  BookmarksService.getById(knexInstance,req.params.bookmarkId)
  .then(bookmark=>{
    if(!bookmark){
      return res.status(404).json({error:{message:'it does not exist'}})
    }
    res.json(bookmark)
  }).catch(next)
})
app.use(errorHandle)
module.exports = app