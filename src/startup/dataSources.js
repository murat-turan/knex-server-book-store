const BookDb = require('../features/book/bookDb')
const DictionariesDb = require('../features/dictionaries/dictionariesDb')

const ds = {
  bookDb: new BookDb(),
  dictionariesDb: new DictionariesDb()
}

module.exports.getDataSources = () => ds

module.exports.initializedDataSources = (context, dbInstance) => {
  ds.bookDb.initialize({ context: { dbInstance } })
  ds.dictionariesDb.initialize({ context: { dbInstance } })
  return ds
}
