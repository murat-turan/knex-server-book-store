//env
const dotenv = require('dotenv')
const result = dotenv.config()
if (result.error) {
  const path = `.env`
  dotenv.config({ path })
}

if (process.env.NODE_ENV) {
  dotenv.config({ path: `./.env.${process.env.NODE_ENV}`, override: true })
}

const keyPerFileEnv = require('@totalsoft/key-per-file-configuration')
const configMonitor = keyPerFileEnv.load()

const { graphqlUploadKoa } = require('graphql-upload')
require('console-stamp')(global.console, {
  format: ':date(yyyy/mm/dd HH:MM:ss.l, utc)'
})

const { ApolloServer } = require('apollo-server-koa'),
  Koa = require('koa'),
  { ApolloServerPluginDrainHttpServer } = require('apollo-server-core'),
  { createServer } = require('http')

// Auth
// const cors = require('@koa/cors')
// const bodyParser = require('koa-bodyparser')

// Logging
const { ApolloLoggerPlugin } = require('@totalsoft/pino-apollo'),
  { logger } = require('./startup')

// Metrics, diagnostics
const { DIAGNOSTICS_ENABLED, METRICS_ENABLED } = process.env,
  diagnosticsEnabled = JSON.parse(DIAGNOSTICS_ENABLED),
  metricsEnabled = JSON.parse(METRICS_ENABLED),
  diagnostics = require('./monitoring/diagnostics'),
  metrics = require('./monitoring/metrics'),
  metricsPlugin = require('./plugins/metrics/metricsPlugin')

// const { publicRoute } = require('./utils/functions'),
//   ignore = require('koa-ignore')

const { dbInstanceFactory } = require('./db')
const {
    // jwtTokenValidation,
    // jwtTokenUserIdentification,
    contextDbInstance
    // correlationMiddleware,
    // errorHandlingMiddleware
  } = require('./middleware'),
  { schema, getDataSources, getDataLoaders } = require('./startup/index')

let apolloServer

const loggingMiddleware = async (ctx, next) => {
  ctx.logger = logger
  await next()
}

async function startServer(httpServer) {
  const app = new Koa()
  app.use(loggingMiddleware)
  // app.use(errorHandlingMiddleware())
  // app.use(bodyParser())
  app.use(graphqlUploadKoa({ maxFieldSize: 10000000, maxFiles: 2 }))
  // app.use(correlationMiddleware())
  // app.use(cors({ credentials: true }))
  // app.use(ignore(jwtTokenValidation, jwtTokenUserIdentification).if(ctx => publicRoute(ctx)))
  app.use(contextDbInstance())

  const plugins = [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    new ApolloLoggerPlugin({ logger, securedMessages: false }),
    metricsEnabled ? metricsPlugin() : {}
  ]

  logger.info('Creating Apollo Server...')
  apolloServer = new ApolloServer({
    schema,
    stopOnTerminationSignals: false,
    uploads: false,
    plugins,
    dataSources: getDataSources,
    context: async ({ ctx }) => {
      const { token, dbInstance, externalUser, request, requestSpan } = ctx
      return {
        token,
        dbInstance,
        dbInstanceFactory,
        dataLoaders: getDataLoaders(dbInstance),
        externalUser,
        request,
        requestSpan,
        logger
      }
    }
  })

  await apolloServer.start()
  apolloServer.getMiddleware({ cors: {} })
  apolloServer.applyMiddleware({ app })
  httpServer.on('request', app.callback())
}

const httpServer = createServer()
startServer(httpServer)
const port = process.env.PORT || 4000
httpServer.listen(port, () => {
  logger.info(`🚀 Server ready at http://localhost:${port}/graphql`)
})

async function cleanup() {
  await configMonitor?.close()
  await apolloServer?.stop()
}

const { gracefulShutdown } = require('@totalsoft/graceful-shutdown')
gracefulShutdown({
  onShutdown: cleanup,
  terminationSignals: ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'],
  unrecoverableEvents: ['uncaughtException', 'unhandledRejection'],
  logger,
  timeout: 5000
})

diagnosticsEnabled && diagnostics.startServer()
metricsEnabled && metrics.startServer()
