import * as winston from "winston";

export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        }),
        new winston.transports.File({
            level: "debug",
            filename: "debug.log"
        }),
        new winston.transports.File({
            level: "error",
            filename: "errors.log",
            handleExceptions: true
        })
    ]
});