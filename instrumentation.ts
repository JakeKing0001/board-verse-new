import type { Instrumentation } from "next";

export function register() {
  // Punto di estensione per un exporter di telemetria in produzione.
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const requestError = error as Error & { digest?: string };
  console.error(
    JSON.stringify({
      event: "request_error",
      message: requestError.message,
      digest: requestError.digest,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      timestamp: new Date().toISOString(),
    }),
  );
};
