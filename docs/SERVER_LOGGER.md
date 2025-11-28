# Building a Production-Grade Logger for Node.js Applications with Pino

In enterprise applications, proper logging is crucial for monitoring, debugging, and maintaining system health. This guide will walk you through implementing a production-ready logging system using Pino, one of the fastest and most feature-rich logging libraries for Node.js.

## Why Pino?

Before diving into implementation, let’s understand why Pino is an excellent choice for production logging:

- Extremely high performance (up to 5x faster than other logging libraries)
- Low overhead and zero dependencies
- Structured JSON logging out of the box
- Support for child loggers
- Built-in support for log rotation
- Extensible through transport streams
- Great integration with modern observability platforms

## Implementation Guide

## Prerequisites

Before we start, make sure you have Node.js (version 14 or higher) installed on your system. You can check your Node.js version by running:

```
node --version
```

## Required Dependencies

First, let’s install all the necessary packages for our production-grade logger. You can use npm or pnpm:

Using npm:

```
npm install express pino pino-pretty rotating-file-stream pino-elasticsearch
```

Using pnpm

```
pnpm add express pino pino-pretty rotating-file-stream pino-elasticsearch
```

> 
> *💡* ***Smart Note****: While* `pino-pretty` *is included, it's only recommended for development. In production, you should use raw JSON logging for better performance and easier parsing.*

Package explanation:

- `express`: Web framework for Node.js
- `pino`: The core logging library, one of the fastest Node.js loggers
- `pino-pretty`: Development-friendly formatted output (dev environment only)
- `rotating-file-stream`: Handles log rotation in production
- `pino-elasticsearch`: Transport for sending logs to Elasticsearch (optional for ELK Stack integration)

## Step 1: Setting Up the Base Structure

Constants separation is crucial for maintainability. By centralizing log levels and environments, you ensure consistency across your application and make changes easier to manage.

```
const LOG_LEVELS = {  TRACE: 'trace',  DEBUG: 'debug',  INFO: 'info',  WARN: 'warn',  ERROR: 'error',  FATAL: 'fatal',};const ENVIRONMENTS = {  DEVELOPMENT: 'development',  STAGING: 'staging',  PRODUCTION: 'production',};module.exports = {  LOG_LEVELS,  ENVIRONMENTS,};
```

**Key Considerations**:

- Keep log levels granular but meaningful
- Match levels to your monitoring strategy
- Consider environment-specific logging needs

## Step 2: Creating the Logger Configuration

Different environments need different logging configurations. Development needs human-readable logs, while production requires machine-parseable format and proper file management.

```
const path = require('path');const defaultConfig = {  development: {    transport: {      targets: [{        target: 'pino-pretty',        level: 'debug',        options: {          colorize: true,          levelFirst: true,          translateTime: 'SYS:standard',        }      }]    },    level: 'debug'  },  production: {    transport: {      targets: [{        target: 'pino/file',        level: 'info',        options: {          destination: path.join(__dirname, '../../../logs/app.log'),          mkdir: true,          sync: false        }      }]    },    level: 'info',    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,        messageKey: 'message',    base: {      env: process.env.NODE_ENV,      version: process.env.npm_package_version    }  }};module.exports = defaultConfig;
```

**Configuration Best Practices**:

1. Use `pino-pretty` only in development
2. Implement file transport in production
3. Configure appropriate log rotation
4. Set correct log levels per environment

## Step 3: Implementing the Logger Factory

The Singleton pattern ensures consistent logger instance across your application. This prevents memory leaks and ensures log consistency.

```
const pino = require('pino');const config = require('./config');const { ENVIRONMENTS } = require('./constants');class LoggerFactory {  static #instance = null;  #logger = null;  constructor() {    if (LoggerFactory.#instance) {      return LoggerFactory.#instance;    }    LoggerFactory.#instance = this;  }  initialize(options = {}) {    const env = process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;    const baseConfig = config[env];        try {      this.#logger = pino({        ...baseConfig,        ...options      });            this.#logger.info({        env,        nodeVersion: process.version,        pid: process.pid      }, 'Logger initialized successfully');    } catch (error) {            console.error('Error initializing logger:', error);      this.#logger = pino({        level: 'info',        timestamp: true      });    }    return this.#logger;  }  getLogger() {    if (!this.#logger) {      this.initialize();    }    return this.#logger;  }  createChildLogger(bindings) {    const logger = this.getLogger();    return logger.child(bindings);  }}module.exports = new LoggerFactory();
```

**Factory Pattern Benefits**:

- Centralized logger configuration
- Easy instance management
- Simplified child logger creation
- Consistent logging behavior

## Step 4: Creating Log Rotation Configuration

Log rotation is crucial for disk space management and log organization. Size-based and time-based rotation should be combined for optimal results.

```
const { createStream } = require('rotating-file-stream');const path = require('path');const rotationStream = createStream('app.log', {  size: '10M',   interval: '1d',   compress: 'gzip',   path: path.join(__dirname, '../../../logs'),});module.exports = rotationStream;
```

**Rotation Recommendations**:

1. Size limit: 10MB per file
2. Time-based rotation: Daily
3. Compression: Enable for storage efficiency
4. Retention: Keep logs min for 30 days
5. Naming: Include timestamp in rotated files

## Step 5: Implementing Middleware for Request Logging

Request logging is essential for debugging and monitoring. Include correlation IDs and response times for effective request tracing.

```
const LoggerFactory = require('../utils/logger/LoggerFactory');function requestLogger() {  const logger = LoggerFactory.getLogger();  return (req, res, next) => {    const startTime = process.hrtime();        res.on('finish', () => {      const [seconds, nanoseconds] = process.hrtime(startTime);      const responseTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);      const logData = {        method: req.method,        url: req.url,        statusCode: res.statusCode,        responseTime: `${responseTime}ms`,        userAgent: req.get('user-agent'),        ip: req.ip,        correlationId: req.get('x-correlation-id'),      };      if (res.statusCode >= 400) {        logger.error(logData, 'Request failed');      } else {        logger.info(logData, 'Request completed');      }    });    next();  };}module.exports = requestLogger;
```

**Request Logging Best Practices**:

1. Log at the beginning and end of requests
2. Include correlation IDs
3. Track response times
4. Log user context when available
5. Exclude sensitive data
6. Include relevant headers

## Step 6: Error Logging Implementation

Comprehensive error logging is crucial for debugging production issues. Include stack traces and contextual information while being mindful of sensitive data.

```
const LoggerFactory = require('./LoggerFactory');class ErrorLogger {  static logError(error, context = {}) {    const logger = LoggerFactory.getLogger();        const errorLog = {      name: error.name,      message: error.message,      stack: error.stack,      code: error.code,      ...context,    };    if (error.response) {      errorLog.response = {        status: error.response.status,        data: error.response.data,      };    }    logger.error(errorLog, 'Application error occurred');  }  static logWarning(warning, context = {}) {    const logger = LoggerFactory.getLogger();        logger.warn({      warning,      ...context,    }, 'Application warning occurred');  }}module.exports = ErrorLogger;
```

**Error Logging Considerations**:

1. Capture full stack traces
2. Include request context
3. Add error codes
4. Log related system states
5. Enable error categorization
6. Implement error alerting

## Step 7: Usage Examples

```
const LoggerFactory = require('./utils/logger/LoggerFactory');const ErrorLogger = require('./utils/logger/errorLogger');const requestLogger = require('./middleware/requestLogger');const express = require('express');const app = express();const logger = LoggerFactory.initialize({  // Additional options if needed});app.use(requestLogger());app.get('/api/users', async (req, res) => {  const routeLogger = LoggerFactory.createChildLogger({    route: '/api/users',    handler: 'getUsers',  });  try {    routeLogger.info('Fetching users');    // Your logic here        routeLogger.info({ count: users.length }, 'Users fetched successfully');    res.json(users);  } catch (error) {    ErrorLogger.logError(error, {      route: '/api/users',      query: req.query,    });    res.status(500).json({ error: 'Internal server error' });  }});
```

## Best Practices for Production Logging

**Log Levels**: Use appropriate log levels:

- TRACE: For detailed debugging
- DEBUG: For development information
- INFO: For general operational events
- WARN: For potentially harmful situations
- ERROR: For error events
- FATAL: For critical errors that require immediate attention

**Structured Logging**: Always use structured logging format (JSON) in production for better parsing and analysis.

**Sensitive Data**: Never log sensitive information such as passwords, tokens, or personal data.

**Correlation IDs**: Include correlation IDs in logs to track requests across services.

**Performance**: Use asynchronous logging in production to minimize impact on application performance.

## Monitoring and Analysis

For production environments, consider integrating with logging platforms:

```
const pinoElastic = require('pino-elasticsearch');const LoggerFactory = require('./utils/logger/LoggerFactory');const transport = pinoElastic({  node: process.env.ELASTICSEARCH_URL,  index: 'app-logs',});const logger = LoggerFactory.initialize({  transport: {    target: 'pino-transport',    options: { transport },  },});
```

## Conclusion

A well-implemented logging system is crucial for maintaining and monitoring production applications. The solution provided above offers:

- Structured JSON logging
- Log rotation
- Environment-specific configuration
- Request/Response logging
- Error tracking
- Performance monitoring
- Easy integration with monitoring platforms

Remember to regularly review and adjust your logging strategy based on your application’s needs and performance requirements.

## Next Steps

- Implement log aggregation (ELK Stack, Splunk, etc.)
- Set up log monitoring and alerting
- Create log analysis dashboards
- Establish log retention policies
- Configure automated log cleanup

Remember to always test your logging implementation thoroughly before deploying to production, and monitor its impact on application performance.