const { dbInstanceFactory } = require('../../db')

const contextDbInstance = () => async (ctx, next) => {
  const dbInstance = await dbInstanceFactory({ logger: ctx.logger })
  ctx.dbInstance = dbInstance

  await next()
}

module.exports = contextDbInstance
