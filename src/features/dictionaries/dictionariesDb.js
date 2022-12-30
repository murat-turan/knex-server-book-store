const { SQLDataSource } = require('../../utils/sqlDataSource')

class DictionariesDb extends SQLDataSource {
  async getCategoryList() {
    const data = await this.knex.select('Id', 'CategoryName').from('Category')
    return data
  }

  async getCategory(categoryId) {
    const result = await this.knex.from('Category').select('Id', 'CategoryName').where('Id', categoryId)
    //console.log('Category => ', result)
    return result[0]
  }
  /*
        .select('Id', 'CategoryName')
        .from('Category')
        .whereIn('Id', ids)
        .then(rows => ids.map(id => rows.find(x => x.id === id)))  
  */
}

module.exports = DictionariesDb
