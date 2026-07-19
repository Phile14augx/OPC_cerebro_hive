import { NextResponse } from 'next/server';
import { Logger } from '../infrastructure/observability/logger';
import { v4 as uuidv4 } from 'uuid';

const apiLogger = new Logger('API_Handler');

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: any;
  traceId: string;
}

export class ApiUtils {
  
  static success<T>(data: T, meta?: any, status: number = 200) {
    const traceId = uuidv4();
    apiLogger.info(`API Success [${status}]`, { traceId, meta });
    return NextResponse.json({ success: true, data, meta, traceId }, { status });
  }

  static error(message: string, status: number = 500, error?: any) {
    const traceId = uuidv4();
    apiLogger.error(`API Error [${status}]: ${message}`, error, { traceId });
    return NextResponse.json({ success: false, error: message, traceId }, { status });
  }

  static unauthorized(message: string = "Unauthorized") {
    return this.error(message, 401);
  }
  
  static notFound(message: string = "Resource not found") {
    return this.error(message, 404);
  }

  static badRequest(message: string = "Bad Request") {
    return this.error(message, 400);
  }
}
