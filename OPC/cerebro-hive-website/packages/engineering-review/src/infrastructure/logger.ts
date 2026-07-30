export function createLogger(correlationId: string) {
  const log = (level: 'info' | 'warn' | 'error', message: string, data?: Record<string, any>) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      correlationId,
      message,
      ...data
    };
    console.log(JSON.stringify(logEntry));
  };

  return {
    info: (msg: string, data?: Record<string, any>) => log('info', msg, data),
    warn: (msg: string, data?: Record<string, any>) => log('warn', msg, data),
    error: (msg: string, data?: Record<string, any>) => log('error', msg, data),
  };
}
