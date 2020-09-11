const { NODE_ENV } = require('./config')
const logger = require('./logger')

function errorHandle (error, req, res, next){
    let response
    if(NODE_ENV ==='production'){
        response = {error: {message: 'server error'}}
    }
    else{
        console.error(error)
        logger.error(error.message)
        response={message:error.message}
    }
    res.status(500).json(response)
}

module.exports = errorHandle