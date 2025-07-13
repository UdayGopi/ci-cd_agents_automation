import client from 'prom-client';

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Pipeline metrics
const pipelineExecutions = new client.Counter({
  name: 'pipeline_executions_total',
  help: 'Total number of pipeline executions',
  labelNames: ['status', 'environment'] as const
});

const pipelineDuration = new client.Histogram({
  name: 'pipeline_duration_seconds',
  help: 'Duration of pipeline executions in seconds',
  labelNames: ['environment'] as const,
  buckets: [60, 180, 300, 600, 1800, 3600] // 1m, 3m, 5m, 10m, 30m, 1h
});

const buildSize = new client.Gauge({
  name: 'build_size_bytes',
  help: 'Size of build artifacts in bytes',
  labelNames: ['pipeline'] as const
});

const activeExecutions = new client.Gauge({
  name: 'active_pipeline_executions',
  help: 'Number of currently running pipeline executions'
});

const testResults = new client.Counter({
  name: 'test_results_total',
  help: 'Total number of test results',
  labelNames: ['result'] as const
});

const deploymentResults = new client.Counter({
  name: 'deployment_results_total',
  help: 'Total number of deployments',
  labelNames: ['environment', 'result'] as const
});

// Register all metrics
register.registerMetric(pipelineExecutions);
register.registerMetric(pipelineDuration);
register.registerMetric(buildSize);
register.registerMetric(activeExecutions);
register.registerMetric(testResults);
register.registerMetric(deploymentResults);

export const metrics = {
  pipelineExecutions,
  pipelineDuration,
  buildSize,
  activeExecutions,
  testResults,
  deploymentResults,
  register
}; 