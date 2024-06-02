const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const { Loggly } = require('winston-loggly-bulk');
require('dotenv').config();

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    format: combine(
        colorize(),
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'
        }),
        new Loggly({
            token: process.env.LOGGLY_CUSTOMER_TOKEN,
            subdomain: process.env.LOGGLY_SUBDOMAIN,
            tags: ['Winston-NodeJS'],
            json: true
        })
    ]
});

module.exports = logger;
