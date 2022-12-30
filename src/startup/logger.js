const { correlationMixin } = require('@totalsoft/pino-correlation')

// General settings
const { LOG_MIN_LEVEL } = process.env,
  logMinLevel = LOG_MIN_LEVEL || 'info'

// DB transport settings
const { LOG_DATABASE, LOG_DATABASE_MINLEVEL, LOG_DATABASE_ENABLED } = process.env,
  logDatabaseEnabled = JSON.parse(LOG_DATABASE_ENABLED || 'false'),
  logDatabaseMinLevel = LOG_DATABASE_MINLEVEL || 'info'

const pino = require('pino')

const options = {
  level: logMinLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin(_context, _level) {
    return { ...correlationMixin() }
  }
}
const transport = pino.transport({
  targets: [
    ...(logDatabaseEnabled
      ? [
          {
            target: '@totalsoft/pino-mssqlserver',
            options: {
              serviceName: 'server-book-store',
              tableName: '__Logs',
              connectionString: LOG_DATABASE
            },
            level: logDatabaseMinLevel
          }
        ]
      : []),
    {
      target: 'pino-pretty',
      options: {
        ignore: 'pid,hostname,correlationId,tenantId,requestId,operationName'
      },
      level: 'trace'
    }
  ]
})

const logger = pino(options, transport)

module.exports = logger
