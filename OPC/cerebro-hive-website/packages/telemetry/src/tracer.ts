// =============================================================================
// CerebroHive — OpenTelemetry Tracer
// Initialises the NodeSDK with OTLP gRPC export + auto-instrumentation.
// Must be required/imported BEFORE any other app code (use -r flag or top of entry).
// =============================================================================

import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  Resource,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/resources';
import {
  W3CTraceContextPropagator,
  CompositePropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import type { SpanExporter } from '@opentelemetry/sdk-trace-base';

let sdk: NodeSDK | undefined;

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion?: string;
  environment?: string;
  otlpEndpoint?: string;
  /** Export to console instead of OTLP (useful for local dev without collector) */
  consoleExport?: boolean;
  /** Sampling ratio 0–1, defaults to 1.0 */
  samplingRatio?: number;
}

export function initTelemetry(config: TelemetryConfig): NodeSDK {
  if (sdk) return sdk;

  const {
    serviceName,
    serviceVersion = process.env.npm_package_version ?? '0.0.0',
    environment = process.env.NODE_ENV ?? 'development',
    otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'grpc://localhost:4317',
    consoleExport = false,
  } = config;

  // Resource attributes
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    'deployment.environment': environment,
    'service.namespace': 'cerebro-hive',
  });

  // Span exporter
  const traceExporter: SpanExporter = consoleExport
    ? new ConsoleSpanExporter()
    : new OTLPTraceExporter({ url: otlpEndpoint });

  // Metric exporter
  const metricExporter = new OTLPMetricExporter({ url: otlpEndpoint });

  sdk = new NodeSDK({
    resource,
    spanProcessor: new BatchSpanProcessor(traceExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10_000,
    }),
    textMapPropagator: new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
      ],
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-http': {
          requestHook: (span, request) => {
            // Suppress noisy health-check spans
            const url = 'url' in request ? (request as any).url : '';
            if (url?.includes('/health') || url?.includes('/metrics')) {
              span.updateName('health_check');
            }
          },
        },
        '@opentelemetry/instrumentation-pg': { enabled: true },
        '@opentelemetry/instrumentation-redis': { enabled: true },
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', async () => {
    await sdk?.shutdown().catch(console.error);
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await sdk?.shutdown().catch(console.error);
    process.exit(0);
  });

  return sdk;
}

export function shutdownTelemetry(): Promise<void> {
  return sdk?.shutdown() ?? Promise.resolve();
}
