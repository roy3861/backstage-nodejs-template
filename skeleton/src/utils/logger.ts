import winston from 'winston';
import { serverConfig } from '../config/server';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  serverConfig.isDev
    ? winston.format.combine(winston.format.colorize(), winston.format.simple())
    : winston.format.json(),
);

export const logger = winston.createLogger({
  level: serverConfig.logLevel,
  format: logFormat,
  defaultMeta: { service: serverConfig.name },
  transports: [
    new winston.transports.Console(),
  ],
});
