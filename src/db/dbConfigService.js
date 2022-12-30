const { postProcessDbResponse, sanitizeConnectionInfo } = require('../utils/functions')

const generateKnexConfig = ({ server, instanceName, port, userName, password, database, trustServerCertificate }) => ({
  client: 'mssql',
  connection: {
    server,
    port: parseInt(port) || null,
    user: userName,
    password,
    database,
    options: {
      enableArithAbort: true,
      trustServerCertificate: JSON.parse(trustServerCertificate?.trim().toLowerCase() || 'false'),
      encrypt: true,
      instanceName: instanceName || undefined
    }
  },
  pool: {
    min: 5,
    max: 25,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    createRetryIntervalMillis: 200,
    idleTimeoutMillis: 5000
  },
  useNullAsDefault: true,
  postProcessResponse: postProcessDbResponse
})

const getDbConfig = () => {
  let connectionInfo
  const {
    DB_HOST: server,
    DB_PORT: port,
    DB_USER: userName,
    DB_PASSWORD: password,
    DB_DATABASE: database,
    DB_INSTANCE_NAME: instanceName,
    DB_TRUST_SERVER_CERTIFICATE: trustServerCertificate
  } = process.env

  connectionInfo = { server, port, userName, password, database, instanceName, trustServerCertificate }

  connectionInfo = sanitizeConnectionInfo(connectionInfo)
  const dbConfig = generateKnexConfig(connectionInfo)
  return dbConfig
}

module.exports = { getDbConfig, generateKnexConfig }
