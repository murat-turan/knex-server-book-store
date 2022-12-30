const { makeExecutableSchema } = require('@graphql-tools/schema')

const { loadTypedefsSync } = require('@graphql-tools/load'),
  { loadFilesSync } = require('@graphql-tools/load-files'),
  { mergeResolvers } = require('@graphql-tools/merge'),
  { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader'),
  { join } = require('path')

const sources = loadTypedefsSync(join(__dirname, '../**/*.graphql'), {
  loaders: [new GraphQLFileLoader()]
})
const typeDefs = sources.map(source => source.document)
const resolvers = mergeResolvers(loadFilesSync(join(__dirname, '../**/resolvers.{js,ts}')))

module.exports = makeExecutableSchema({ typeDefs, resolvers })
module.exports.tests = { typeDefs, resolvers }
