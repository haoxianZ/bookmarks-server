const BookmarksService = {
    getAll(knex){
        return knex.select('*').from('bookmarks')
    },
    insertBookmark(knex, newBookmark){
        return knex.insert(newBookmark).into('bookmarks').returning('*').then(rows => {return rows[0]})
    },
    getById(knex,id){
        return knex.select('*').from('bookmarks').where('id',id).first()
    },
    deleteById(knex,id){
        return knex('bookmarks').where({id}).delete()
    },
    updateArticle(knex,id, updateArticle){
        return knex('bookmarks').where({id}).update(updateArticle)
    }
}
module.exports =  BookmarksService