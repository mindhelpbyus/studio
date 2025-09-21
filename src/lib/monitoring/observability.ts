/**
 * Multi-Cloud Observability System
 * Unified monitoring, logging, and tracing across all cloud providers
 */

import { CloudProvider, CloudMonitoringService, LogLevel } from '../cloud/interfaces';
import { getCloudFactory } from '../cloud/factory';

export interface MetricDefinition {
  name: string;
  description: string;
  unit: string;
  dimensions?: string[];
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  service: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'ok' | 'error' | 'timeout';
  tags: Record<string, string>;
  logs: LogEntry[];
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: Date;
  details?: Record<string, any>;
  error?: string;
}

export class ObservabilityManager {
  private static instance: ObservabilityManager;
  private monitoringService: CloudMonitoringService;
  private activeTraces: Map<string, TraceSpan> = new Map();
  private metrics: Map<string, MetricDefinition> = new Map();
  private healthChecks: Map<string, () => Promise<HealthCheckResult>> = new Map();

  private constructor() {
    const factory = getCloudFactory();
    this.monitoringService = factory.createMonitoringService();
    this.initializeDefaultMetrics();
  }

  static getInstance(): ObservabilityManager {
    if (!ObservabilityManager.instance) {
      ObservabilityManager.instance = new ObservabilityManager();
    }
    return ObservabilityManager.instance;
  }

  private initializeDefaultMetrics(): void {
    const defaultMetrics: MetricDefinition[] = [
      {
        name: 'http_requests_total',
        description: 'Total number of HTTP requests',
        unit: 'count',
        dimensions: ['method', 'status_code', 'endpoint'],
        aggregation: 'sum',
      },
      {
        name: 'http_request_duration',
        description: 'HTTP request duration in milliseconds',
        unit: 'milliseconds',
        dimensions: ['method', 'endpoint'],
        aggregation: 'avg',
      },
      {
        name: 'database_connections_active',
        description: 'Number of active database connections',
        unit: 'count',
        aggregation: 'avg',
      },
      {
        name: 'memory_usage',
        description: 'Memory usage in bytes',
        unit: 'bytes',
        aggregation: 'avg',
      },
      {
        name: 'cpu_usage',
        description: 'CPU usage percentage',
        unit: 'percent',
        aggregation: 'avg',
      },
      {
        name: 'error_rate',
        description: 'Error rate percentage',
        unit: 'percent',
        dimensions: ['service', 'error_type'],
        aggregation: 'avg',
      },
    ];

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric.name, metric);
    });
  }

  // Metrics Management
  async recordMetric(
    name: string,
    value: number,
    dimensions?: Record<string, string>
  ): Promise<void> {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Unknown metric: ${name}`);
      return;
    }

    try {
      await this.monitoringService.putMetric(name, value, metric.unit, dimensions);
    } catch (error) {
      console.error(`Failed to record metric ${name}:`, error);
    }
  }

  async recordHttpRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number
  ): Promise<void> {
    const dimensions = { method, endpoint, status_code: statusCode.toString() };
    
    await Promise.all([
      this.recordMetric('http_requests_total', 1, dimensions),
      this.recordMetric('http_request_duration', duration, { method, endpoint }),
    ]);
  }

  async recordError(
    service: string,
    errorType: string,
    error: Error
  ): Promise<void> {
    await this.recordMetric('error_rate', 1, { service, error_type: errorType });
    
    // Also log the error
    await this.log('error', `Error in ${service}: ${error.message}`, {
      service,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  // Logging
  async log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      service: metadata?.service || 'unknown',
      traceId: metadata?.traceId,
      spanId: metadata?.spanId,
      userId: metadata?.userId,
      sessionId: metadata?.sessionId,
      metadata,
      error: metadata?.error,
    };

    try {
      await this.monitoringService.log(level, message, metadata);
      
      // Also emit to console in development
      if (process.env.NODE_ENV === 'development') {
        this.logToConsole(logEntry);
      }
    } catch (error) {
      console.error('Failed to log message:', error);
      this.logToConsole(logEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const service = entry.service.padEnd(10);
    
    let logMessage = `${timestamp} [${level}] ${service} ${entry.message}`;
    
    if (entry.traceId) {
      logMessage += ` [trace:${entry.traceId}]`;
    }
    
    if (entry.error) {
      logMessage += `\nError: ${entry.error.name} - ${entry.error.message}`;
      if (entry.error.stack) {
        logMessage += `\nStack: ${entry.error.stack}`;
      }
    }
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      logMessage += `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }

    switch (entry.level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
    }
  }

  // Distributed Tracing
  startTrace(operationName: string, parentSpanId?: string): string {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    
    const span: TraceSpan = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      startTime: new Date(),
      status: 'ok',
      tags: {},
      logs: [],
    };
    
    this.activeTraces.set(spanId, span);
    return spanId;
  }

  finishTrace(spanId: string, status: 'ok' | 'error' | 'timeout' = 'ok'): void {
    const span = this.activeTraces.get(spanId);
    if (!span) {
      console.warn(`Span not found: ${spanId}`);
      return;
    }
    
    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.status = status;
    
    // Send trace to monitoring service
    this.monitoringService.trace(span).catch(error => {
      console.error('Failed to send trace:', error);
    });
    
    this.activeTraces.delete(spanId);
  }

  addTraceTag(spanId: string, key: string, value: string): void {
    const span = this.activeTraces.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  addTraceLog(spanId: string, level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const span = this.activeTraces.get(spanId);
    if (span) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        message,
        service: metadata?.service || 'unknown',
        traceId: span.traceId,
        spanId,
        metadata,
      };
      span.logs.push(logEntry);
    }
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateSpanId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  // Health Checks
  registerHealthCheck(name: string, checkFunction: () => Promise<HealthCheckResult>): void {
    this.healthChecks.set(name, checkFunction);
  }

  async runHealthCheck(name: string): Promise<HealthCheckResult> {
    const checkFunction = this.healthChecks.get(name);
    if (!checkFunction) {
      return {
        service: name,
        status: 'unhealthy',
        responseTime: 0,
        timestamp: new Date(),
        error: 'Health check not found',
      };
    }

    const startTime = Date.now();
    try {
      const result = await checkFunction();
      result.responseTime = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        service: name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async runAllHealthChecks(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};
    
    const promises = Array.from(this.healthChecks.keys()).map(async (name) => {
      results[name] = await this.runHealthCheck(name);
    });
    
    await Promise.all(promises);
    return results;
  }

  // Performance Monitoring
  async measurePerformance<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const spanId = this.startTrace(operationName);
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.addTraceTag(spanId, 'success', 'true');
      this.addTraceTag(spanId, 'duration', duration.toString());
      
      await this.recordMetric('operation_duration', duration, {
        operation: operationName,
        ...metadata,
      });
      
      this.finishTrace(spanId, 'ok');
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.addTraceTag(spanId, 'success', 'false');
      this.addTraceTag(spanId, 'error', error instanceof Error ? error.message : String(error));
      
      await this.recordError('performance', 'operation_failed', error instanceof Error ? error : new Error(String(error)));
      
      this.finishTrace(spanId, 'error');
      throw error;
    }
  }

  // System Metrics Collection
  async collectSystemMetrics(): Promise<void> {
    try {
      // Memory usage
      const memoryUsage = process.memoryUsage();
      await this.recordMetric('memory_usage', memoryUsage.heapUsed);
      await this.recordMetric('memory_total', memoryUsage.heapTotal);

      // CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      await this.recordMetric('cpu_user_time', cpuUsage.user);
      await this.recordMetric('cpu_system_time', cpuUsage.system);

      // Event loop lag
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
        this.recordMetric('event_loop_lag', lag).catch(console.error);
      });

    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  // Start periodic metric collection
  startMetricCollection(intervalMs: number = 60000): void {
    setInterval(() => {
      this.collectSystemMetrics().catch(console.error);
    }, intervalMs);
  }
}

// Middleware for Express.js/Next.js
export function observabilityMiddleware() {
  const observability = ObservabilityManager.getInstance();
  
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const spanId = observability.startTrace(`HTTP ${req.method} ${req.path}`);
    
    // Add trace context to request
    req.traceId = observability.activeTraces.get(spanId)?.traceId;
    req.spanId = spanId;
    
    // Add tags
    observability.addTraceTag(spanId, 'http.method', req.method);
    observability.addTraceTag(spanId, 'http.url', req.url);
    observability.addTraceTag(spanId, 'http.user_agent', req.get('User-Agent') || '');
    
    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      // Record metrics
      observability.recordHttpRequest(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration
      ).catch(console.error);
      
      // Add response tags
      observability.addTraceTag(spanId, 'http.status_code', res.statusCode.toString());
      observability.addTraceTag(spanId, 'http.response_size', res.get('Content-Length') || '0');
      
      // Finish trace
      const status = res.statusCode >= 400 ? 'error' : 'ok';
      observability.finishTrace(spanId, status);
      
      originalEnd.apply(this, args);
    };
    
    next();
  };
}

// Decorator for automatic tracing
export function traced(operationName?: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const traceName = operationName || `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = async function(...args: any[]) {
      const observability = ObservabilityManager.getInstance();
      return observability.measurePerformance(traceName, () => originalMethod.apply(this, args));
    };
    
    return descriptor;
  };
}

// Singleton access
export const observability = ObservabilityManager.getInstance();

// Convenience functions
export async function log(level: LogLevel, message: string, metadata?: Record<string, any>): Promise<void> {
  return observability.log(level, message, metadata);
}

export async function recordMetric(name: string, value: number, dimensions?: Record<string, string>): Promise<void> {
  return observability.recordMetric(name, value, dimensions);
}

export function startTrace(operationName: string, parentSpanId?: string): string {
  return observability.startTrace(operationName, parentSpanId);
}

export function finishTrace(spanId: string, status: 'ok' | 'error' | 'timeout' = 'ok'): void {
  return observability.finishTrace(spanId, status);
}