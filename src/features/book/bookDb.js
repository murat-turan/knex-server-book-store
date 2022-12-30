const { SQLDataSource } = require('../../utils/sqlDataSource')
const {
  generateTopClause,
  getSortByValue,
  generateSortByPkClause,
  generatePrevPageWhereClause,
  generateOrderByClause
} = require('../common/dbGenerators')

class BookDb extends SQLDataSource {
  generateFromAndWhereClause(queryBuilder, { afterId, filters = {}, direction = 1, sortBy = 'Id', sortByValue }) {
    const { bookName, authorName, stock } = filters

    queryBuilder.from('Book')

    //if (bookName) queryBuilder.andWhere('BookName', bookName)
    if (bookName) queryBuilder.whereRaw('UPPER(BookName) LIKE ?', `%${bookName.toUpperCase()}%`)

    //if (authorName) queryBuilder.andWhereLike('AuthorName', 'authorName')
    if (authorName) queryBuilder.whereRaw('UPPER(AuthorName) LIKE ?', `%${authorName.toUpperCase()}%`)

    if (stock) queryBuilder.andWhere('Stock', '<=', stock)

    if (afterId)
      queryBuilder.modify(generateSortByPkClause, {
        sortBy,
        pk: 'Id',
        direction,
        afterId,
        sortByValue
      })
  }

  async getBook(bookId) {
    const result = await this.knex
      .from('Book')
      .select('Id', 'BookName', 'AuthorName', 'Stock', 'CategoryId')
      .where('Id', bookId)
    //console.log('Book', result)
    return result[0]
  }

  //   async getBookList() {
  //     const books = await this.knex.from('Book').select('Id', 'BookName', 'AuthorName', 'Stock').orderBy('Id')
  //     return { books }
  //   }

  async getBookListTotalCount(filters = {}) {
    const totalCount = await this.knex('Book')
      .modify(this.generateFromAndWhereClause, filters)
      .count('Id', { as: 'TotalCount' })
      .first()
    return totalCount
  }

  async getBookListPreviousPageAfterId(pager, filters, sortByValue) {
    const { pageSize, afterId, sortBy = 'Id', direction = 1 } = pager
    const prevPage = await this.knex
      .select('Id')
      .modify(this.generateFromAndWhereClause, { filters })
      .modify(generateOrderByClause, { sortBy, direction: !direction, pk: 'Id' })
      .modify(generatePrevPageWhereClause, { afterId, direction, sortBy, sortByValue, pk: 'Id' })
      .modify(generateTopClause, pageSize)
    return prevPage[pageSize - 1]
  }

  async getBookList(pager, filters) {
    const { page, pageSize, sortBy = 'Id', direction = 1, afterId } = pager
    const sortByValue = await getSortByValue(this.knex, afterId, sortBy, 'Book', 'Id')

    console.log('page, pageSize <= ', page, pageSize)

    //console.log('sortByValue', sortByValue)

    const books = await this.knex
      .select('Id', 'BookName', 'AuthorName', 'Stock', 'CategoryId')
      .from('Book')
      .modify(this.generateFromAndWhereClause, { filters, afterId, direction, sortBy, sortByValue })
      .modify(generateOrderByClause, { sortBy, direction, pk: 'Id' })
      //.modify(generateTopClause, pageSize ? pageSize + 1 : null, page)
      .modify(generateTopClause, pageSize ? pageSize : null, page)

    console.log('Books count => ', books.length)

    return { books, sortByValue }
  }

  async insertCategory(category) {
    const content = {
      CategoryName: category.categoryName
    }

    const result = await this.knex('Category').returning('Id').insert(content)
    return result[0]
  }

  async updateBook({ id, bookName, authorName, stock, category }) {
    const content = {
      BookName: bookName,
      AuthorName: authorName,
      Stock: stock,
      CategoryId: category.id
    }
    const output = ['Id', 'BookName', 'AuthorName', 'Stock', 'CategoryId']

    let result
    if (id) {
      // Update
      result = await this.knex('Book').update(content, output).where('Id', id)
    } else {
      // Insert
      result = await this.knex('Book').returning(output).insert(content)
    }

    return result[0]
  }

  async deleteBook(id) {
    let result
    result = await this.knex('Book').where('Id', id).returning('BookName').del()
    return result[0]
    //await this.knex('Book').whereIn('Id', id).del()
  }
}

module.exports = BookDb
