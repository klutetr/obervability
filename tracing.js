const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
// Jaeger Exporter
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Exporter
module.exports = (serviceName) => {
   // Configure Jaeger exporter
   const exporter = new JaegerExporter({
       serviceName: serviceName,
       endpoint: 'http://localhost:14268/api/traces', // Default Jaeger endpoint
   });

   // Set up tracing provider
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });

   provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
   provider.register();

   // Register instrumentations
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });

   return trace.getTracer(serviceName);
};