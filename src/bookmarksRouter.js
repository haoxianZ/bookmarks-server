const express = require('express')
const BookmarksService = require('./bookmarks-service')
const bookmarksRouter = express.Router()
const jsonParser = express.json()
const xss = require('xss')
bookmarksRouter.route('/bookmarks').get((req,res,next)=>{
    BookmarksService.getAll(req.app.get('db'))
    .then(bookmarks=>{
        res.json(bookmarks)
    }).catch(next)
}).post(jsonParser,(req,res,next)=>{
    const { title, rating, url, description } = req.body
    if(!title){
        return res.status(400).json({
            error:{message:'missing title'}
        })
    }
    if(!rating){
        return res.status(400).json({
            error:{message:'missing rating'}
        })
    }
    if(!url){
        return res.status(400).json({
            error:{message:'missing url'}
        })
    }
    const newbookmark = { title, rating, url, description }
    BookmarksService.insertBookmark(
      req.app.get('db'),
      newbookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(bookmark)
      })
      .catch(next)
})

bookmarksRouter.route('/bookmarks/:bookmark_id')
.all((req,res,next)=>{
    const knexInstance = req.app.get('db')
    BookmarksService.getById(knexInstance,req.params.bookmark_id)
    .then(bookmark=>{
        if (!bookmark){
            return res.status(404).json({
                error:{message: 'bookmark not exist'}
            })
        }
        console.log(bookmark)
        res.bookmark = bookmark
        next()
    }).catch(next)})
    .get((req,res,next)=>{
        res.json({
            id:res.bookmark.id,
            url: xss(res.bookmark.url),
            title: xss(res.bookmark.title),
            rating: res.bookmark.rating,
            description: xss(res.bookmark.description)
        })
    }       
).delete((req,res,next)=>{
    BookmarksService.deleteById(req.app.get('db'),req.params.bookmark_id)
    .then(()=>{
        res.status(204).end()
    }).catch(next)
}).patch(jsonParser,(req,res,next)=>{
    const {title, url, rating, description} = req.body
    const articleToUpdate = {title, url, rating, description}
    const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length
      if (numberOfValues === 0) {
          return res.status(400).json({
              error:{message: `Request body must contain either 'title', 'description' or 'rating'`}
          })
      }
    BookmarksService.updateArticle(
        req.app.get('db'),
        req.params.bookmark_id,
        articleToUpdate
        //what is the numRowsAffected?
        ).then(numRowsAffected=>{
          res.status(204).end()  
        }).catch(next)
})

module.exports = bookmarksRouter