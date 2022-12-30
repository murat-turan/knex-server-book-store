const bookResolvers = {
  Query: {
    // Get Book by Id
    book: async (_, { id }, { dataSources }) => {
      const data = await dataSources.bookDb.getBook(id)
      //console.log('book', data)
      return data
    },
    // Get All Books
    bookList: async (_, { pager, filters }, { dataSources }) => {
      const { pageSize } = pager

      console.log('Query bookList executed')

      const data = await dataSources.bookDb.getBookList(pager, filters)
      //return data
      const { books, sortByValue } = data

      //console.log('books', books)

      return pageSize //? { books, nextAfterId: books[pageSize], sortByValue }
        ? { books: books?.slice(0, pageSize), nextAfterId: books[pageSize], sortByValue }
        : { books, sortByValue }
    }
  },
  BookList: {
    pagination: async ({ nextAfterId, sortByValue }, { pager, filters }, { dataSources }) => {
      console.log('filters', filters)
      const { totalCount } = await dataSources.bookDb.getBookListTotalCount(filters)
      const prevPageId = await dataSources.bookDb.getBookListPreviousPageAfterId(pager, filters, sortByValue)
      const prevPage = { ...pager, afterId: prevPageId && prevPageId.id }
      const nextPage = { ...pager, afterId: nextAfterId ? nextAfterId.id : null }

      const result = { totalCount, prevPage, nextPage }
      console.log(result)
      return result
    }
  },
  Book: {
    category: async ({ categoryId }, _, { dataSources }) => {
      const category = await dataSources.dictionariesDb.getCategory(categoryId)
      //console.log('Book category catId => ', categoryId)
      return category
    }
  },
  Mutation: {
    // Insert and Update Book
    saveBook: async (_, { input }, { dataSources }) => {
      const res = await dataSources.bookDb.updateBook(input)
      //console.log(res)
      return res
    },
    // Delete Book
    deleteBook: async (_, { id }, { dataSources }) => {
      const name = await dataSources.bookDb.deleteBook(id)
      return name
    }
  }
}

module.exports = bookResolvers
