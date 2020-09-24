const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe('Bookmark Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup',() => db('bookmarks').truncate())

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testArticles = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testArticles)
      })

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testArticles)
      })
    })
  })

  describe(`GET /bookmarks/:bookmarks_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .get(`/bookmarks/${articleId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `bookmark not exist` } })
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testArticles = makeBookmarksArray()
      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testArticles)
      })

      it('responds with 200 and the specified article', () => {
        const articleId = 2
        const expectedArticle = testArticles[articleId - 1]
        return supertest(app)
          .get(`/bookmarks/${articleId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedArticle)
      })
    })
    context(`Given an XSS attack article`, () => {
           const maliciousArticle = {
             id: 911,
            title: 'Naughty naughty very naughty <script>alert("xss");</script>',
             url: 'How-to',
             rating: 1,
             description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
           }
      
           beforeEach('insert malicious article', () => {
             return db
               .into('bookmarks')
               .insert([ maliciousArticle ])
           })
      
           it('removes XSS attack content', () => {
             return supertest(app)
               .get(`/bookmarks/${maliciousArticle.id}`)
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(200)
               .expect(res => {
                 expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                 expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
               })
           })
    })
  })

  describe('Post /bookmarks',()=>{
  it('creastes a bookmark and respond it',()=>{
    this.retries(4)
    const newArticle = {
      title: 'test',
      url: 'Story.com',
      description:'testing new article',
      rating: 4
    }
    return supertest(app).post('/bookmarks')
    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
    .send(newArticle).expect(201).expect(res=>{
      expect(res.body.title).to.eql(newArticle.title)
      expect(res.body.url).to.eql(newArticle.url)
      expect(res.body.rating).to.eql(newArticle.rating)
      expect(res.body).to.have.property('id')
      expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
    }).then(postRes=>
      supertest(app).get(
        `/bookmarks/${postRes.body.id}`
      )
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(postRes.body))
  })
  const requiredFileds = ['title','url','rating' ]
  requiredFileds.forEach(field=>{
    const newArticle = {
      title: 'test',
      url: 'Story',
      rating:'5'
    }
  it(`respond with 400 error when miss a field`,()=>{
    delete newArticle[field]
    return supertest(app).post('/bookmarks')
    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
    .send(newArticle).expect(400,{error: {message:`missing ${field}`}})
  })  
  })
})

describe(`Delete /bookmarks/:bookmarks_id`,()=>{
  context('Given there are article',()=>{
    const testArticles = makeBookmarksArray()
    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testArticles)
    })
    it('respond with 204 and remove',()=>{
      const idRemove = 2;
      const expectArticles = testArticles.filter(article=> article.id !==idRemove)
      return supertest(app).delete(`/bookmarks/${idRemove}`)
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(204).then(res=> supertest(app).get('/bookmarks')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(expectArticles))
    })
  })
  context('Given no article',()=>{
    it('respond with 404',()=>{
      return supertest(app).delete('/bookmarks/123')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(404,{error:{message:'bookmark not exist'}})
    })
  })
  describe.only(`PATCH /bookmarks/:article_id`,()=>{
    context('Given no article',()=>{
      it('respond with 404',()=>{
        const articleId = 123456
        return supertest(app).patch(`/bookmarks/${articleId}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(404, {error:{message: 'bookmark not exist'}})
  
      })
    })
    context('Given there is data',()=>{
      const testArticles = makeBookmarksArray()
      beforeEach('insert articles', () => {
        return db
          .into('bookmarks')
          .insert(testArticles)
      })
      it('respond with 204 and remove',()=>{
        const idUpdated = 2;
        const updateArticle={
          title: 'test',
          url: 'Story',
          rating:'4'
        }
        //not understand line187-189, tgat replace the target?
        const expectedArticle = {
          ...testArticles[idUpdated-1],
          ...updateArticle
        }//the set(apitoken) is repeated many times, is there a better way?
        return supertest(app).patch(`/bookmarks/${idUpdated}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send(updateArticle).expect(204)
        .then(res=> supertest(app).get(`/bookmarks/${idUpdated}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(expectedArticle))
      })
      it('respond with 400 when required field is missing',()=>{
        const idToUpdate = 2
        return supertest(app).patch(`/bookmarks/${idToUpdate}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .send({ irrelevantField: 'foo' }).expect(400, 
        {error:
          {message: `Request body must contain either 'title', 'description' or 'rating'`}
        }
      )
    })
    it(`responds with 204 when updating only a subset of fields`, () => {
            const idToUpdate = 2
            const updateArticle = {
              title: 'updated article title',
            }
            const expectedArticle = {
              ...testArticles[idToUpdate - 1],
              ...updateArticle
            }
      
            return supertest(app)
              .patch(`/bookmarks/${idToUpdate}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .send({
                ...updateArticle,
                fieldToIgnore: 'should not be in GET response'
              })
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/bookmarks/${idToUpdate}`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(expectedArticle)
              )
          })
  })
  })
})
})

