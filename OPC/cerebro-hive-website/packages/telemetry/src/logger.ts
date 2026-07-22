export const logger = {
  info: (msg: string, ctx?: Record<string, any>) => console.log(JSON.stringify({ level: 'info', msg, ...ctx, timestamp: new Date().toISOString() })),
  error: (msg: string, err?: any, ctx?: Record<string, any>) => console.error(JSON.stringify({ level: 'error', msg, err, ...ctx, timestamp: new Date().toISOString() })),
  warn: (msg: string, ctx?: Record<string, any>) => console.warn(JSON.stringify({ level: 'warn', msg, ...ctx, timestamp: new Date().toISOString() })),
  debug: (msg: string, ctx?: Record<string, any>) => console.debug(JSON.stringify({ level: 'debug', msg, ...ctx, timestamp: new Date().toISOString() }))
};
