const dictionaryResolvers = {
  Query: {
    categoryList: async (_, __, { dataSources }) => {
      const data = await dataSources.dictionariesDb.getCategoryList()
      return data
    },
    categoryById: async (_, { id }, { dataSources }) => {
      const data = await dataSources.dictionariesDb.getCategory(id)
      console.log('Category (resolver) ', data)
      return data
    }
  }
}

module.exports = dictionaryResolvers
