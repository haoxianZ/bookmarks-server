const express =require('express');
const { v4: uuidv4 } = require('uuid');
const validUrl= require('valid-url')
const logger = require('./logger')
const store = require('./store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter.route('/bookmarks')
.get((req,res)=>{
    res.json(store.bookmarks)
}).post(bodyParser,(req,res)=>{
    const {title, url, description, rating} = req.body;
    if (!title){
        logger.error('title is required')
        return res.status(400).send('title is required')
    }
    if (!url){
        logger.error('title is required')
        return res.status(400).send('title is required')
    }
    if (!rating){
        logger.error('title is required')
        return res.status(400).send('title is required')
    }
    if(!validUrl.isUri(url)){
        logger.error(`${url} is invalid url`)
        res.status(400).send(`${url} is invalid url`)
    }
    if(!Number.isInteger(rating)||rating<0||rating>5){
        logger.error(`${rating} is invalid`)
        return res.status(400).send('rating must be integer between 0 and 5')
    }
    const newMark = {id:uuidv4(), title, url, description, rating}
    store.bookmarks.push(newMark)
    logger.info(`New BookMark ${newMark.id} created`)
    res.status(201).location(`http://localhost:8000/bookmarks/${newMark.id}`)
    .json(newMark)

})

bookmarksRouter.route('/bookmarks/:bookmarkId')
.get((req,res)=>{
    const {bookmarkId} = req.params
    const bookmark = store.bookmarks.find(c=>c.id == bookmarkId)
    if(!bookmark){
        logger.error(`Bookmark ${bookmarkId} not found`)
        return res.status(404).send('Bookmark not found')
    }
    res.status(200).json(bookmark)
}).delete((req,res)=>{
    const {bookmarkId} = req.params
    const index = store.bookmarks.findIndex(c=> c.id ==bookmarkId)
    if(index ===-1 ){
        logger.error(`Bookmark ${bookmarkId} not found`)
        return res.status(404).send('Bookmark not found')
    }
    store.bookmarks.splice(index,1)
    logger.info(`bookmar ${bookmarkId} is deleted`);
    res.status(204).end()
})

module.exports= bookmarksRouter