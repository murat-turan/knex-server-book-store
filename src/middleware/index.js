const correlationMiddleware = require('./correlation/correlationMiddleware')
const validateToken = require('./auth/auth')
const errorHandlingMiddleware = require('./errorHandling/errorHandlingMiddleware')
const contextDbInstance = require('./db/contextDbInstance')

module.exports = {
  ...validateToken,
  contextDbInstance,
  correlationMiddleware,
  errorHandlingMiddleware
}
