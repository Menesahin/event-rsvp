import pino, { type Logger } from "pino";

export const logger: Logger =
  process.env.NODE_ENV === "production"
    ? pino({
        level: "info",
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
        messageKey: "message",
        base: {
          env: process.env.NODE_ENV,
          service: "event-rsvp",
        },
      })
    : pino({
        transport: {
          target: "pino-pretty",
          options: { colorize: true, levelFirst: true },
        },
        level: "debug",
      });
